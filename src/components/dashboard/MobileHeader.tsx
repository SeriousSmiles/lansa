import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { getContrastTextColor } from "@/utils/colorUtils";
import { MobileUserProfile } from "@/components/mobile/MobileUserProfile";

interface MobileHeaderProps {
  themeColor?: string;
  items: Array<{ title: string; url: string; }>;
  userName: string;
  email: string;
  onLogout: () => Promise<void>;
}

export function MobileHeader({ themeColor, items, userName, email, onLogout }: MobileHeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <div 
        onClick={() => navigate("/dashboard")}
        className="cursor-pointer"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <MobileUserProfile 
          userName={userName}
          email={email}
          handleLogout={onLogout}
          themeColor={themeColor}
        />
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border shadow-lg">
            <DropdownMenuItem onSelect={() => {
              setIsMenuOpen(false);
              navigate("/discovery");
            }}>
              Discovery
            </DropdownMenuItem>
            {items.filter(item => item.title !== "Dashboard").map((item) => (
              <DropdownMenuItem key={item.title} onSelect={() => {
                setIsMenuOpen(false);
                navigate(item.url);
              }}>
                {item.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
