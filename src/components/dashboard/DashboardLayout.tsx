
import { useState, useEffect, useRef } from "react";
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
import { gsap } from "gsap";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  email: string;
  themeColor?: string;
}

export function DashboardLayout({ children, userName, email, themeColor }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);

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
  
  // Animation for content loading
  useEffect(() => {
    if (mainContentRef.current) {
      // Set initial state
      gsap.set(mainContentRef.current, { opacity: 0, y: 20 });
      
      // Animate in
      gsap.to(mainContentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => setIsContentVisible(true)
      });
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)]">
        <Sidebar className="animate-fade-in-left">
          <DashboardSidebarHeader />
          
          <SidebarContent className="mt-4 lg:mt-6">
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuItems items={menuItems} themeColor={themeColor} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooterContent 
            userName={userName} 
            email={email} 
            handleLogout={handleLogout}
            themeColor={themeColor}
          />
        </Sidebar>
        
        <main className="flex-1">
          <MobileHeader themeColor={themeColor} />
          <div ref={mainContentRef} className="container mx-auto pt-0 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
