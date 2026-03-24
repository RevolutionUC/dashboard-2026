"use client";

import {
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Home,
  Inbox,
  QrCode,
  NotepadText,
  ScrollText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu items (without Plan, which has sub-items).
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "QR",
    url: "/qr",
    icon: QrCode,
  },
  {
    title: "Emails",
    url: "/emails",
    icon: Inbox,
    roles: ["admin", "lead"],
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
];

const planSubItems = [
  {
    title: "Day of Schedule",
    url: "/plan/day-of-schedule",
    icon: CalendarDays,
  },
  {
    title: "Events",
    url: "/plan/events",
    icon: CalendarRange,
  },
];

export function AppSidebar() {
  const { data: session } = authClient.useSession();
  const [dashboardRole, setDashboardRole] = useState<string>("lead");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/role")
        .then((res) => res.json())
        .then((data) => setDashboardRole(data.dashboardRole || "lead"))
        .catch(() => setDashboardRole("lead"));
    }
  }, [session?.user]);

  const isAdmin = dashboardRole === "admin";
  const isOrganizer = dashboardRole === "organizer";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => !item.roles || item.roles.includes(dashboardRole || ""))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Plan with collapsible sub-menu - not for organizers */}
              {!isOrganizer && (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <NotepadText />
                      <span>Plan</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {planSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/approvals">
                      <ShieldCheck />
                      <span>Approvals</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/logs">
                      <ScrollText />
                      <span>Audit Logs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
