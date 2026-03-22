import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getTemplateById,
    renderTemplateToHtml,
    renderTemplateToText,
} from "@/lib/templates";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { db } from "@/lib/db";
import { accessRequests, participants } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

type RecipientType = "all" | "status" | "specific";

interface SendEmailRequest {
    templateId: string;
    subject?: string;
    body?: string;
    recipientType: RecipientType;
    status?: string;
    specificEmails?: string[];
}

// Templates that use per-recipient confirmation URLs
const CONFIRM_ATTENDANCE_ID = "confirm-attendance";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userRole = (session.user as { role?: string }).role;
        if (userRole !== "admin") {
            const [request] = await db
                .select({ status: accessRequests.status })
                .from(accessRequests)
                .where(eq(accessRequests.userId, session.user.id))
                .limit(1);

            if (!request || request.status !== "approved") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const {
            templateId,
            subject,
            body,
            recipientType,
            status,
            specificEmails,
        }: SendEmailRequest = await request.json();

        // Validate request
        if (!templateId) {
            return NextResponse.json(
                { error: "Template ID is required" },
                { status: 400 },
            );
        }

        if (!recipientType) {
            return NextResponse.json(
                { error: "Recipient type is required" },
                { status: 400 },
            );
        }

        if (recipientType === "status" && !status) {
            return NextResponse.json(
                { error: "Status is required when filtering by status" },
                { status: 400 },
            );
        }

        if (
            recipientType === "specific" &&
            (!specificEmails || specificEmails.length === 0)
        ) {
            return NextResponse.json(
                {
                    error: "At least one email is required for specific recipients",
                },
                { status: 400 },
            );
        }

        if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
            return NextResponse.json(
                { error: "Mailgun configuration is missing" },
                { status: 500 },
            );
        }

        // Fetch recipients and build personalization map (email → {firstName, userId})
        let recipients: string[] = [];
        const participantMap = new Map<string, { firstName: string; userId: string }>();

        try {
            if (recipientType === "all") {
                const allParticipants = await db
                    .select({ email: participants.email, firstName: participants.firstName, userId: participants.user_id })
                    .from(participants);
                for (const p of allParticipants) {
                    participantMap.set(p.email, { firstName: p.firstName, userId: p.userId });
                }
                recipients = allParticipants.map((p) => p.email);
            } else if (recipientType === "status") {
                const statusParticipants = await db
                    .select({ email: participants.email, firstName: participants.firstName, userId: participants.user_id })
                    .from(participants)
                    .where(eq(participants.status, status as any));
                for (const p of statusParticipants) {
                    participantMap.set(p.email, { firstName: p.firstName, userId: p.userId });
                }
                recipients = statusParticipants.map((p) => p.email);
            } else if (recipientType === "specific") {
                const knownParticipants = await db
                    .select({ email: participants.email, firstName: participants.firstName, userId: participants.user_id })
                    .from(participants)
                    .where(inArray(participants.email, specificEmails ?? []));
                for (const p of knownParticipants) {
                    participantMap.set(p.email, { firstName: p.firstName, userId: p.userId });
                }
                recipients = specificEmails || [];
            }
        } catch (dbError) {
            console.error("Database query error:", dbError);
            return NextResponse.json(
                { error: "Failed to fetch recipients from database" },
                { status: 500 },
            );
        }

        if (recipients.length === 0) {
            return NextResponse.json(
                { error: "No recipients found matching the criteria" },
                { status: 400 },
            );
        }

        // Verify template exists
        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: "Template not found" },
                { status: 404 },
            );
        }

        // Validate email addresses
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipients.filter(
            (email) => !emailRegex.test(email),
        );
        if (invalidEmails.length > 0) {
            return NextResponse.json(
                {
                    error: `Invalid email addresses: ${invalidEmails.join(", ")}`,
                },
                { status: 400 },
            );
        }

        const emailSubject = subject || template.subject;
        const isConfirmAttendance = templateId === CONFIRM_ATTENDANCE_ID;
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

        // Render template once with Mailgun recipient-variable placeholders.
        // Mailgun substitutes %recipient.X% per delivery, so each recipient
        // sees their own personalized content with a single render + API call.
        const templateProps: Record<string, string | boolean | undefined> = {
            subject: emailSubject,
            body,
            firstName: "%recipient.firstName%",
            ...(isConfirmAttendance && {
                yesConfirmationUrl: "%recipient.yesUrl%",
                noConfirmationUrl: "%recipient.noUrl%",
            }),
        };

        const [html, text] = await Promise.all([
            renderTemplateToHtml(templateId, templateProps),
            renderTemplateToText(templateId, templateProps),
        ]);

        if (!html || !text) {
            return NextResponse.json(
                { error: "Failed to render email template" },
                { status: 500 },
            );
        }

        // Build per-recipient variable map for Mailgun substitution
        const recipientVariables: Record<string, Record<string, string>> = {};
        for (const email of recipients) {
            const participant = participantMap.get(email);
            const vars: Record<string, string> = {
                firstName: participant?.firstName ?? "Hacker",
            };
            if (isConfirmAttendance && participant) {
                vars.yesUrl = `${baseUrl}/api/confirm?id=${participant.userId}&response=yes`;
                vars.noUrl = `${baseUrl}/api/confirm?id=${participant.userId}&response=no`;
            }
            recipientVariables[email] = vars;
        }

        // Initialize Mailgun
        const mailgun = new Mailgun(formData);
        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY,
        });

        const mailgunDomain = process.env.MAILGUN_DOMAIN;
        const fromEmail =
            process.env.MAILGUN_FROM_EMAIL || "info@revolutionuc.com";

        // Send in batches of 1000 (Mailgun's limit)
        const BATCH_SIZE = 1000;
        const results = [];

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);
            const batchVars = Object.fromEntries(
                batch.map((email) => [
                    email,
                    recipientVariables[email] ?? { firstName: "Hacker" },
                ]),
            );

            try {
                const response = await mg.messages.create(mailgunDomain, {
                    from: fromEmail,
                    to: batch,
                    subject: emailSubject,
                    html: html,
                    text: text,
                    "recipient-variables": JSON.stringify(batchVars),
                });

                console.log(
                    `Batch ${Math.floor(i / BATCH_SIZE) + 1} sent (${batch.length} recipients):`,
                    response.id,
                );
                results.push({
                    batch: Math.floor(i / BATCH_SIZE) + 1,
                    count: batch.length,
                    success: true,
                    messageId: response.id,
                });
            } catch (error) {
                console.error(
                    `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
                    error,
                );
                results.push({
                    batch: Math.floor(i / BATCH_SIZE) + 1,
                    count: batch.length,
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
            }
        }

        console.log("Email batch completed:", {
            templateId,
            recipientType,
            status: recipientType === "status" ? status : undefined,
            recipientCount: recipients.length,
            sentBy: "authenticated-user",
            results,
        });

        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.length - successCount;

        return NextResponse.json({
            success: failedCount === 0,
            message: `Sent to ${recipients.length} recipient(s)`,
            results,
            recipientCount: recipients.length,
            successCount,
            failedCount,
        });
    } catch (error) {
        console.error("Error sending emails:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
