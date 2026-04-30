import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { getDashboardAccessInfo } from "@/lib/dashboard-access";
import { PendingApprovalClient } from "./client";

export default async function PendingApprovalPage() {
  const access = await getDashboardAccessInfo();
  if (access.isAdmin) {
    redirect("/dashboard");
  }

  // Check the user's access request status
  const [request] = await db
    .select({
      status: accessRequests.status,
      requestedAt: accessRequests.requestedAt,
    })
    .from(accessRequests)
    .where(eq(accessRequests.userId, access.userId))
    .limit(1);

  // If approved, redirect to dashboard
  if (request?.status === "approved") {
    redirect("/dashboard");
  }

  return (
    <PendingApprovalClient
      userName={access.userName}
      userEmail={access.userEmail}
      userImage={access.userImage}
      status={request?.status ?? "pending"}
      userId={access.userId}
    />
  );
}
