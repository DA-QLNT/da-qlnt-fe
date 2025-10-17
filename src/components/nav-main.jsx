import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <NavLink
              to={item.url}
              key={item.title}
              end={item.url === "/admin"}
            >
              {({ isActive }) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton  tooltip={item.title} isActive={isActive}>
                    {item.icon && <item.icon />}
                    <span className="font-normal">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </NavLink>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
