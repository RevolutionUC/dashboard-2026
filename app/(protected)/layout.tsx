import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthHeader } from "@/components/auth-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { getDashboardAccessInfo } from "@/lib/dashboard-access";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getDashboardAccessInfo();

  // Admins always have access
  if (access.isAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b px-4">
            <SidebarTrigger />
            <AuthHeader />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    );
  }

  // Check if the user has an approved access request
  const [request] = await db
    .select({ status: accessRequests.status })
    .from(accessRequests)
    .where(eq(accessRequests.userId, access.userId))
    .limit(1);

  if (!request || request.status !== "approved") {
    redirect("/pending-approval");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />
          <AuthHeader />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
