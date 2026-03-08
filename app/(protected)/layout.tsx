import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthHeader } from "@/components/auth-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Not authenticated - redirect to sign-in
  if (!session?.user) {
    redirect("/sign-in");
  }

  const userRole = (session.user as { role?: string }).role;

  // Admins always have access
  if (userRole === "admin") {
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
    .where(eq(accessRequests.userId, session.user.id))
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
