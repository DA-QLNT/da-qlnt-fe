import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconHome,
  IconInnerShadowTop,
  IconSettings,
  IconUsers,
  IconKey,
  IconUserShield,
  IconBrandAsana,
  IconDeviceDesktopDollar,
  IconUserStar,
  IconReceipt2,
  IconReceipt,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth";

const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  navMainAdmin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Roles",
      url: "/admin/roles",
      icon: IconUserShield,
    },
    {
      title: "Permissions",
      url: "/admin/permissions",
      icon: IconKey,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
  ],
  navMainOwner: [
    {
      title: "Dashboard",
      url: "/owner",
      icon: IconDashboard,
    },
    {
      title: "Houses",
      url: "/owner/houses",
      icon: IconHome,
    },
    {
      title: "Tenants",
      url: "/owner/tenants",
      icon: IconUserStar,
    },
    {
      title: "Users",
      url: "/owner/users",
      icon: IconUsers,
    },
    {
      title: "Rules",
      url: "/owner/rules",
      icon: IconBrandAsana,
    },
    {
      title: "Assets",
      url: "/owner/assets",
      icon: IconDeviceDesktopDollar,
    },
    {
      title: "Services",
      url: "/owner/services",
      icon: IconSettings,
    },
  ],
  navMainTenant: [
    {
      title: "Dashboard",
      url: "/tenant",
      icon: IconDashboard,
    },
    {
      title: "Room",
      url: "/tenant/rooms",
      icon: IconHome,
    },
    {
      title: "Invoice",
      url: "/tenant/invoices",
      icon: IconReceipt2,
    },
    {
      title: "Contract",
      url: "/tenant/contracts",
      icon: IconReceipt,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { isAdmin, isOwner, isUser, isTenant, user } = useAuth();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">PTIT </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isAdmin && <NavMain items={data.navMainAdmin} />}
        {isOwner && <NavMain items={data.navMainOwner} />}
        {/* {isUser && <NavMain items={data.navMainOwner} />} */}
        {isTenant && <NavMain items={data.navMainTenant} />}

        {/* <NavMain items={data.navMain} /> */}
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
