import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getContrastTextColor } from "@/utils/colorUtils";
import { LucideIcon } from "lucide-react";
import { UserProfile } from "./UserProfile";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

interface TopNavbarProps {
  items: MenuItem[];
  userName: string;
  email: string;
  onLogout: () => Promise<void>;
  themeColor?: string;
}

export function TopNavbar({ items, userName, email, onLogout, themeColor }: TopNavbarProps) {
  const isDarkTheme = themeColor ? getContrastTextColor(themeColor) === "#FFFFFF" : false;

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background"
      style={themeColor ? { borderColor: `${themeColor}30` } : {}}
    >
      <div className="flex w-full flex-wrap items-center justify-between px-6 lg:px-8 h-14 gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Lansa Logo"
            className="h-6 w-auto"
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          {items.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className="px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              style={themeColor ? { color: themeColor } : {}}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block w-56">
            <div className="relative">
              <Input placeholder="Search" className="h-9" />
            </div>
          </div>
          <Link to="/profile">
            <Button className="btn-animate" size="sm">Resume Builder</Button>
          </Link>
          <UserProfile 
            userName={userName}
            email={email}
            handleLogout={onLogout}
            themeColor={themeColor}
          />
        </div>
      </div>
    </header>
  );
}
