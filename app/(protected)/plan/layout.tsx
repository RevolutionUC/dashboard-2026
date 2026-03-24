import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole === "admin") return children;

  const [userData] = await db
    .select({ dashboardRole: userTable.dashboardRole })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (userData?.dashboardRole === "organizer") {
    redirect("/dashboard");
  }

  return children;
}
