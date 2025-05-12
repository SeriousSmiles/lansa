
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
  themeColor?: string;
}

export function SidebarMenuItems({ items, themeColor }: SidebarMenuItemsProps) {
  // Calculate if the theme is dark
  const getContrastTextColor = (hexColor: string): string => {
    if (!hexColor) return "#000000";
    
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance - standard formula for brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors and white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

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
