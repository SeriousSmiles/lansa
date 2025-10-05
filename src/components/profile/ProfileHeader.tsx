
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileHeaderActions } from "./ProfileHeaderActions";
import { getContrastTextColor, isDarkTheme as checkIsDarkTheme } from "@/utils/colorUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ProfileHeaderProps {
  userName: string;
  role: string;
  user: any;
  userId?: string;
  coverColor: string;
  highlightColor?: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  readOnly?: boolean;
  hideBackButton?: boolean;
  onOpenGuidedSetup?: () => void;
  userProfile?: any; // Add profile data for preview
}

export function ProfileHeader({ 
  userName, 
  role, 
  user, 
  userId,
  coverColor, 
  highlightColor = "#FF6B4A",
  onCoverColorChange,
  onHighlightColorChange,
  readOnly = false,
  hideBackButton = false,
  onOpenGuidedSetup,
  userProfile
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Calculate text contrast color (black or white) based on background
  const textColor = getContrastTextColor(coverColor);
  
  // Determine if the theme is dark based on luminance
  const isDarkTheme = checkIsDarkTheme(coverColor);
  
  return (
    <header 
      className="flex min-h-[72px] w-full px-4 sm:px-6 md:px-16 items-center shadow-sm"
      style={{
        backgroundColor: `${coverColor}15`, // Very light version of theme color
        borderBottom: `1px solid ${coverColor}30`
      }}
    >
      {!hideBackButton && (
        <Button 
          variant={isDarkTheme ? "contrast" : "ghost"}
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="mr-2 flex-shrink-0"
          style={{
            color: textColor
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
        alt="Lansa Logo"
        className={`aspect-[2.7] object-contain w-[80px] sm:w-[92px] flex-shrink-0 ${hideBackButton && readOnly ? "mx-auto" : ""}`}
      />
      
      {!readOnly && (
        <div className="ml-auto">
          <ProfileHeaderActions
            userId={userId}
            userName={userName}
            coverColor={coverColor}
            highlightColor={highlightColor}
            onCoverColorChange={onCoverColorChange}
            onHighlightColorChange={onHighlightColorChange}
            textColor={textColor}
            isDarkTheme={isDarkTheme}
            isMobile={isMobile}
            onOpenGuidedSetup={onOpenGuidedSetup}
            userProfile={userProfile}
          />
        </div>
      )}
    </header>
  );
}
