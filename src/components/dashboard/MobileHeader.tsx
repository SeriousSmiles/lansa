import React from "react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { getContrastTextColor } from "@/utils/colorUtils";

interface MobileHeaderProps {
  themeColor?: string;
  items: Array<{ title: string; url: string; }>;
}

export function MobileHeader({ themeColor, items }: MobileHeaderProps) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border shadow-lg">
            {items.filter(item => item.title !== "Dashboard").map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <Link to={item.url} className="w-full">
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full">
                Resume Builder
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
