import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userData] = await db
    .select({ dashboardRole: userTable.dashboardRole })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  return NextResponse.json({
    dashboardRole: userData?.dashboardRole || "lead",
  });
}
