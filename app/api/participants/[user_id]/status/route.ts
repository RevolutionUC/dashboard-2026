import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { isParticipantStatus } from "@/lib/participant-status";
import { logAction } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ user_id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { user_id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const nextStatus = (body as { status?: unknown } | null | undefined)?.status;
  if (!isParticipantStatus(nextStatus)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }
  // Fetch the current status before updating so we can log the transition
  const [current] = await db
    .select({
      status: participants.status,
      firstName: participants.firstName,
      lastName: participants.lastName,
    })
    .from(participants)
    .where(eq(participants.user_id, user_id))
    .limit(1);

  if (!current) {
    return NextResponse.json(
      { message: "Participant not found" },
      { status: 404 },
    );
  }

  const previousStatus = current.status;

  const checkedIn = nextStatus === "CHECKED_IN";
  const updated = await db
    .update(participants)
    .set({
      status: nextStatus,
      checkedIn,
      updatedAt: new Date(),
    })
    .where(eq(participants.user_id, user_id))
    .returning({ user_id: participants.user_id })
    .then((r) => r[0]);

  if (!updated) {
    return NextResponse.json(
      { message: "Participant not found" },
      { status: 404 },
    );
  }

  await logAction({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    action: "UPDATE_STATUS",
    targetId: user_id,
    details: {
      name: current.firstName + " " + current.lastName,
      from: previousStatus,
      to: nextStatus,
    },
  });

  return NextResponse.json({ ok: true });
}
