import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";

export async function getParticipantByUserId(userId: string) {
  const [participant] = await db
    .select({
      user_id: participants.user_id,
      firstName: participants.firstName,
      lastName: participants.lastName,
      email: participants.email,
      status: participants.status,
      checkedIn: participants.checkedIn,
      shirtSize: participants.shirtSize,
      dietRestrictions: participants.dietRestrictions,
    })
    .from(participants)
    .where(eq(participants.user_id, userId))
    .limit(1);

  if (!participant) {
    return {
      error: NextResponse.json({ error: "Participant not found" }, { status: 404 }),
    } as const;
  }

  return { participant } as const;
}
