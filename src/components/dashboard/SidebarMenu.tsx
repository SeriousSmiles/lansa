import { Link } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { getContrastTextColor } from "@/utils/colorUtils";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

interface SidebarMenuItemsProps {
  items: MenuItem[];
  themeColor?: string;
}

export function SidebarMenuItems({ items, themeColor }: SidebarMenuItemsProps) {
  // Determine if we need to add a background
  const isDarkTheme = themeColor ? getContrastTextColor(themeColor) === "#FFFFFF" : false;
  
  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.url} 
              className={`flex w-full items-center gap-3 ${isDarkTheme ? 'bg-black/10 hover:bg-black/20' : ''}`}
              style={themeColor ? { color: themeColor } : {}}
            >
              <item.icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
