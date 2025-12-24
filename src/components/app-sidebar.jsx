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
  IconContract,
  IconWritingFilled,
  IconHammer,
  IconReceiptDollar,
  IconLayoutDashboard,
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
import GradientText from "./GradientText";

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
      icon: IconLayoutDashboard,
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
    // {
    //   title: "Analytics",
    //   url: "/admin/analytics",
    //   icon: IconChartBar,
    // },
  ],
  navMainOwner: [
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
      title: "Contracts",
      // url: "/owner/contracts/houses",
      url: "/owner/contracts",
      icon: IconContract,
    },
    {
      title: "Services",
      url: "/owner/services",
      icon: IconSettings,
    },
    {
      title: "RecordMeters & CreateInvoices",
      url: "/owner/recordmeters",
      icon: IconDashboard,
    },
    {
      title: "Invoices",
      url: "/owner/invoices",
      icon: IconReceiptDollar,
    },
    {
      title: "Statistics",
      url: "/owner/statistics",
      icon: IconChartBar,
    },
    {
      title: "Assets",
      url: "/owner/assets",
      icon: IconDeviceDesktopDollar,
    },
    {
      title: "Repairs",
      url: "/owner/repairs",
      icon: IconHammer,
    },
    {
      title: "Rules",
      url: "/owner/rules",
      icon: IconBrandAsana,
    },
    {
      title: "Dashboard",
      url: "/owner",
      icon: IconLayoutDashboard,
    },
  ],
  navMainTenant: [
    {
      title: "Dashboard",
      url: "/tenant",
      icon: IconDashboard,
    },
    // {
    //   title: "Rooms",
    //   url: "/tenant/rooms",
    //   icon: IconHome,
    // },
    {
      title: "Invoices",
      url: "/tenant/invoices",
      icon: IconReceipt2,
    },
    {
      title: "Contracts",
      url: "/tenant/contracts",
      icon: IconReceipt,
    },
    {
      title: "Repairs",
      url: "/tenant/repairs",
      icon: IconHammer,
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
              className="data-[slot=sidebar-menu-button]:p-1.5! h-12"
            >
              <a href="#">
                <img
                  className="h-12 w-12 object-contain rounded-full shadow-sm"
                  src="https://lh3.google.com/u/0/d/1eZej4XXjDg5r68w5kpQZCZ__CBVV-9Tf=w1864-h889-iv1?auditContext=prefetch"
                  alt="logo"
                />
                <GradientText className="text-xl ml-4">HĐN</GradientText>
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
