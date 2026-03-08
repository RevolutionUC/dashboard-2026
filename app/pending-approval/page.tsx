import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { PendingApprovalClient } from "./client";

export default async function PendingApprovalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userRole = (session.user as { role?: string }).role;

  // Admins are always approved
  if (userRole === "admin") {
    redirect("/dashboard");
  }

  // Check the user's access request status
  const [request] = await db
    .select({
      status: accessRequests.status,
      requestedAt: accessRequests.requestedAt,
    })
    .from(accessRequests)
    .where(eq(accessRequests.userId, session.user.id))
    .limit(1);

  // If approved, redirect to dashboard
  if (request?.status === "approved") {
    redirect("/dashboard");
  }

  return (
    <PendingApprovalClient
      userName={session.user.name}
      userEmail={session.user.email}
      userImage={session.user.image}
      status={request?.status ?? "pending"}
      userId={session.user.id}
    />
  );
}
