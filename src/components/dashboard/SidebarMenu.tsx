
import { Link } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

interface SidebarMenuItemsProps {
  items: MenuItem[];
}

export function SidebarMenuItems({ items }: SidebarMenuItemsProps) {
  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton asChild>
            <Link to={item.url} className="flex w-full items-center gap-3">
              <item.icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
