import { redirect } from "next/navigation";
import { getDashboardAccessInfo } from "@/lib/dashboard-access";

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getDashboardAccessInfo();
  if (access.dashboardRole === "organizer") {
    redirect("/dashboard");
  }

  return children;
}
