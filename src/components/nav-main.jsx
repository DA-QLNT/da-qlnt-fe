import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function NavMain({ items }) {
  const { t } = useTranslation("sidebar");
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <NavLink to={item.url} key={item.title} end={item.url === "/admin"}>
              {({ isActive }) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={t(`${item.title}`)}
                    isActive={isActive}
                  >
                    {item.icon && <item.icon />}
                    <span className="font-normal">{t(`${item.title}`)}</span>
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
