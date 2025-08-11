
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { TopNavbar } from "./TopNavbar";
import { Home, BookOpen, Video, User } from "lucide-react";

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
      <TopNavbar 
        items={menuItems}
        userName={userName}
        email={email}
        onLogout={handleLogout}
        themeColor={themeColor}
      />
      <main className="flex-1">
        <div ref={mainContentRef} className="w-full pt-2 md:pt-3">
          {children}
        </div>
      </main>
    </div>
  );
}
