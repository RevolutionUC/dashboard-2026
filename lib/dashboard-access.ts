import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

interface DashboardAccessInfo {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  authRole?: string;
  dashboardRole?: string;
  isAdmin: boolean;
}

export async function getDashboardAccessInfo(): Promise<DashboardAccessInfo> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const authRole = (session.user as { role?: string }).role;
  if (authRole === "admin") {
    return {
      userId: session.user.id,
      userName: session.user.name ?? null,
      userEmail: session.user.email ?? null,
      userImage: session.user.image ?? null,
      authRole,
      dashboardRole: "admin",
      isAdmin: true,
    };
  }

  const [userData] = await db
    .select({ dashboardRole: userTable.dashboardRole })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  return {
    userId: session.user.id,
    userName: session.user.name ?? null,
    userEmail: session.user.email ?? null,
    userImage: session.user.image ?? null,
    authRole,
    dashboardRole: userData?.dashboardRole ?? undefined,
    isAdmin: userData?.dashboardRole === "admin",
  };
}
