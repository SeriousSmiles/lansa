import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getContrastTextColor } from "@/utils/colorUtils";
import { UserProfile } from "./UserProfile";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useUserType } from "@/hooks/useUserType";
import { TablerIcon } from "@tabler/icons-react";
import { AnimatedTabNav } from "@/components/navigation/AnimatedTabNav";

type MenuItem = {
  title: string;
  url: string;
  icon: TablerIcon;
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
  const { t } = useTranslation();
  const { userType } = useUserType();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background"
      style={themeColor ? { borderColor: `${themeColor}30` } : {}}
    >
      <div className="flex w-full max-w-[1440px] mx-auto flex-wrap items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-14 gap-2 sm:gap-4">
        {/* Logo */}
        <Link to={userType === 'employer' ? "/employer-dashboard" : "/dashboard"} className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Lansa Logo"
            className="h-6 w-auto"
          />
        </Link>

        {/* Animated Tab Navigation */}
        <div className="hidden md:flex items-center">
          <AnimatedTabNav items={items} themeColor={themeColor} />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {userType !== 'employer' && (
            <Link to="/profile">
              <Button className="btn-animate" size="sm">{t('navbar.resumeBuilder')}</Button>
            </Link>
          )}
          <LanguageSwitcher />
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
