import { redirect } from "next/navigation";
import { getDashboardAccessInfo } from "@/lib/dashboard-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getDashboardAccessInfo();
  if (!access.isAdmin) {
    redirect("/dashboard");
  }

  return children;
}
