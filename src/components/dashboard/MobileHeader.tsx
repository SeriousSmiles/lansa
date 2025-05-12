
import React from "react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface MobileHeaderProps {
  themeColor?: string;
}

export function MobileHeader({ themeColor }: MobileHeaderProps) {
  // Calculate text contrast color (black or white) based on background
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
      <SidebarTrigger 
        style={themeColor ? { 
          color: themeColor,
          ...(isDarkTheme && { backgroundColor: 'rgba(0, 0, 0, 0.1)' })
        } : {}} 
      />
    </div>
  );
}
