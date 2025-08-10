import React from "react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getContrastTextColor } from "@/utils/colorUtils";

interface MobileHeaderProps {
  themeColor?: string;
}

export function MobileHeader({ themeColor }: MobileHeaderProps) {
  // Determine if the theme is dark based on luminance
  const isDarkTheme = themeColor ? getContrastTextColor(themeColor) === "#FFFFFF" : false;
  
  return (
    <div 
      className="flex md:hidden min-h-16 items-center justify-between border-b bg-background px-4"
      style={themeColor ? { 
        backgroundColor: `${themeColor}10`,
        borderColor: `${themeColor}30`
      } : {}}
    >
      <Link to="/dashboard">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/profile">
          <Button size="sm" className="btn-animate">Resume Builder</Button>
        </Link>
        <SidebarTrigger 
          style={themeColor ? { 
            color: themeColor,
            ...(isDarkTheme && { backgroundColor: 'rgba(0, 0, 0, 0.1)' })
          } : {}} 
        />
      </div>
    </div>
  );
}
