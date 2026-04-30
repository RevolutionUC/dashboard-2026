import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/api/session-auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

export async function GET() {
  const auth = await requireAuthenticatedSession();
  if ("error" in auth) {
    return auth.error;
  }
  const { session } = auth;

  const [userData] = await db
    .select({ dashboardRole: userTable.dashboardRole })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  return NextResponse.json({
    dashboardRole: userData?.dashboardRole || "lead",
  });
}
