
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Home, BookOpen, Video, User } from "lucide-react";
import { DashboardSidebarHeader } from "./SidebarHeader";
import { SidebarMenuItems } from "./SidebarMenu";
import { SidebarFooterContent } from "./SidebarFooter";
import { MobileHeader } from "./MobileHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  email: string;
}

export function DashboardLayout({ children, userName, email }: DashboardLayoutProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
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
    },
    {
      title: "My Profile",
      url: "/profile",
      icon: User,
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)]">
        <Sidebar>
          <DashboardSidebarHeader />
          
          <SidebarContent className="mt-4 lg:mt-6">
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuItems items={menuItems} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooterContent 
            userName={userName} 
            email={email} 
            handleLogout={handleLogout}
          />
        </Sidebar>
        
        <main className="flex-1">
          <MobileHeader />
          <div className="container mx-auto pt-0 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
