
import React from "react";
import {
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { SidebarMenuItems } from "./SidebarMenu";
import { AnimatedProfileButton } from "./AnimatedProfileButton";
import { HelpCircle, Settings } from "lucide-react";

interface SidebarFooterContentProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
  themeColor?: string;
}

export function SidebarFooterContent({ userName, email, handleLogout, themeColor }: SidebarFooterContentProps) {
  const footerItems = [
    {
      title: "Support",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    }
  ];

  return (
    <SidebarFooter className="flex flex-col gap-4 pb-6 pt-6 lg:gap-6 lg:pb-6">
      <SidebarSeparator />
      <div>
        <SidebarMenuItems items={footerItems} themeColor={themeColor} />
      </div>
      <SidebarSeparator />
      <AnimatedProfileButton 
        userName={userName} 
        email={email} 
        handleLogout={handleLogout}
      />
      <div className="mt-4 text-xs text-center text-[#1A1F71]">
        &copy; {new Date().getFullYear()} Lansa N.V.
      </div>
    </SidebarFooter>
  );
}
