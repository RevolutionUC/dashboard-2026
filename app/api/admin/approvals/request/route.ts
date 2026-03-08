import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { sendAccessRequestEmail } from "@/lib/email";

// Admin emails to notify
const ADMIN_EMAILS = [
  "bilwarad@mail.uc.edu",
  "karthikeya.rachamolla@gmail.com",
];

// POST /api/admin/approvals/request - Re-request access (for denied users)
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId } = body as { userId: string };

  // Users can only re-request for themselves
  if (userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check current request status
  const [existingRequest] = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.userId, userId))
    .limit(1);

  if (!existingRequest) {
    return NextResponse.json(
      { error: "No existing request found" },
      { status: 404 },
    );
  }

  if (existingRequest.status === "approved") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 });
  }

  if (existingRequest.status === "pending") {
    return NextResponse.json(
      { error: "Request already pending" },
      { status: 400 },
    );
  }

  // Reset to pending
  await db
    .update(accessRequests)
    .set({
      status: "pending",
      reviewedAt: null,
      reviewedBy: null,
      requestedAt: new Date(),
    })
    .where(eq(accessRequests.id, existingRequest.id));

  // Notify admins
  for (const adminEmail of ADMIN_EMAILS) {
    sendAccessRequestEmail(
      adminEmail,
      session.user.name,
      session.user.email,
    ).catch((err: unknown) =>
      console.error(`Failed to send re-request email to ${adminEmail}:`, err),
    );
  }

  return NextResponse.json({ success: true });
}
