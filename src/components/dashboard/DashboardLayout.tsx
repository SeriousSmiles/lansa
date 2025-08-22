
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { TopNavbar } from "./TopNavbar";
import { MobileHeader } from "./MobileHeader";
import { IconHome, IconBook, IconVideo, IconUser } from "@tabler/icons-react";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconHome,
    },
    {
      title: "Resources",
      url: "/resources",
      icon: IconBook,
    },
    {
      title: "Content Library", 
      url: "/content",
      icon: IconVideo,
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
    <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)] flex-col">
      <AnnouncementBanner />
      {isMobile ? (
        <MobileHeader 
          themeColor={themeColor} 
          items={menuItems} 
          userName={userName}
          email={email}
          onLogout={handleLogout}
        />
      ) : (
        <TopNavbar 
          items={menuItems}
          userName={userName}
          email={email}
          onLogout={handleLogout}
          themeColor={themeColor}
        />
      )}
      <main className="flex-1">
        <div ref={mainContentRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-2 md:pt-3">
          {children}
        </div>
      </main>
    </div>
  );
}
