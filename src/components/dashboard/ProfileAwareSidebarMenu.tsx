
import { Link } from "react-router-dom";
import { Home, BookOpen, Video } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { getContrastTextColor } from "@/utils/colorUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

interface ProfileAwareSidebarMenuProps {
  themeColor?: string;
  userName: string;
  profileImage?: string;
}

export function ProfileAwareSidebarMenu({ themeColor, userName, profileImage }: ProfileAwareSidebarMenuProps) {
  // Determine if we need to add a background
  const isDarkTheme = themeColor ? getContrastTextColor(themeColor) === "#FFFFFF" : false;
  
  const regularItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Resources",
      url: "/resources",
      icon: BookOpen,
    },
    {
      title: "Content Library",
      url: "/content",
      icon: Video,
    }
  ];
  
  return (
    <SidebarMenu>
      {regularItems.map((item, index) => (
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
      
      {/* Special My Profile menu item with profile image */}
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to="/profile" 
            className={`flex w-full items-center gap-3 ${isDarkTheme ? 'bg-black/10 hover:bg-black/20' : ''}`}
            style={themeColor ? { color: themeColor } : {}}
          >
            <Avatar className="w-5 h-5">
              <AvatarImage src={profileImage} alt={userName} />
              <AvatarFallback className="text-xs">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>My Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
