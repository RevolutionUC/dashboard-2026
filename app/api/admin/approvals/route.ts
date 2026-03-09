import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests, user as userTable } from "@/lib/db/schema";
import { sendApprovalEmail, sendDenialEmail } from "@/lib/email";
import { logAction } from "@/lib/audit";

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    return null;
  }

  return session;
}

// GET /api/admin/approvals - List access requests
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let query = db
    .select({
      id: accessRequests.id,
      userId: accessRequests.userId,
      email: accessRequests.email,
      name: accessRequests.name,
      image: accessRequests.image,
      status: accessRequests.status,
      requestedAt: accessRequests.requestedAt,
      reviewedAt: accessRequests.reviewedAt,
      reviewedBy: accessRequests.reviewedBy,
    })
    .from(accessRequests)
    .orderBy(accessRequests.requestedAt)
    .$dynamic();

  if (
    statusFilter &&
    ["pending", "approved", "denied"].includes(statusFilter)
  ) {
    query = query.where(
      eq(
        accessRequests.status,
        statusFilter as "pending" | "approved" | "denied",
      ),
    );
  }

  const requests = await query;
  return NextResponse.json(requests);
}

// PATCH /api/admin/approvals - Approve or deny a request
export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { requestId, action } = body as {
    requestId: string;
    action: "approve" | "deny" | "revoke";
  };

  if (!requestId || !["approve", "deny", "revoke"].includes(action)) {
    return NextResponse.json(
      {
        error:
          "Invalid request. Provide requestId and action (approve/deny/revoke).",
      },
      { status: 400 },
    );
  }

  // Get the access request
  const [existingRequest] = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.id, requestId))
    .limit(1);

  if (!existingRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "approved" : "denied";

  // Update the access request
  await db
    .update(accessRequests)
    .set({
      status: newStatus,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    })
    .where(eq(accessRequests.id, requestId));

  // If approved, also update the user role to "user" (ensure not banned etc.)
  if (action === "approve") {
    await db
      .update(userTable)
      .set({ banned: false })
      .where(eq(userTable.id, existingRequest.userId));

    await logAction({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      action: "APPROVE_USER",
      details: {
        targetName: existingRequest.name,
        targetEmail: existingRequest.email,
      },
    });
  } else {
    await logAction({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      action: "DENY_USER",
      details: {
        targetName: existingRequest.name,
        targetEmail: existingRequest.email,
      },
    });
  }

  // Send notification email (fire-and-forget)
  if (action === "approve") {
    sendApprovalEmail(existingRequest.email, existingRequest.name).catch(
      (err: unknown) => console.error("Failed to send approval email:", err),
    );
  } else {
    sendDenialEmail(existingRequest.email, existingRequest.name).catch(
      (err: unknown) => console.error("Failed to send denial email:", err),
    );
  }

  return NextResponse.json({
    success: true,
    status: newStatus,
  });
}
