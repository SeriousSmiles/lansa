
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserState } from "@/contexts/UserStateProvider";
import { gsap } from "gsap";
import { TopNavbar } from "./TopNavbar";

import { IconHome, IconBook, IconVideo, IconUser, IconBriefcase, IconMessage } from "@tabler/icons-react";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  email: string;
  themeColor?: string;
}

export function DashboardLayout({ children, userName, email, themeColor }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { userType } = useUserState();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = userType === 'employer'
    ? [
        {
          title: "Dashboard",
          url: "/employer-dashboard",
          icon: IconHome,
        },
        {
          title: "Browse Candidates",
          url: "/browse-candidates",
          icon: IconUser,
        },
        {
          title: "Messages",
          url: "/chat",
          icon: IconMessage,
        },
      ]
    : userType === 'mentor'
    ? [
        {
          title: "Dashboard",
          url: "/mentor-dashboard",
          icon: IconHome,
        },
        {
          title: "Content Library",
          url: "/content",
          icon: IconVideo,
        },
      ]
    : [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconHome,
        },
        {
          title: "Jobs",
          url: "/jobs",
          icon: IconBriefcase,
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
        },
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
      <div className="sticky top-0 z-40">
        <AnnouncementBanner />
        <TopNavbar 
          items={menuItems}
          userName={userName}
          email={email}
          onLogout={handleLogout}
          themeColor={themeColor}
        />
      </div>
      <main className="flex-1">
        <div ref={mainContentRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-2 md:pt-3">
          {children}
        </div>
      </main>
    </div>
  );
}
