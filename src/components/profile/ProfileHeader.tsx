
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileHeaderActions } from "./ProfileHeaderActions";
import { getContrastTextColor, isDarkTheme as checkIsDarkTheme } from "@/utils/colorUtils";

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
  readOnly = false
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  // Calculate text contrast color (black or white) based on background
  const textColor = getContrastTextColor(coverColor);
  
  // Determine if the theme is dark based on luminance
  const isDarkTheme = checkIsDarkTheme(coverColor);
  
  return (
    <header 
      className="flex min-h-[72px] w-full px-4 md:px-16 items-center shadow-sm"
      style={{
        backgroundColor: `${coverColor}15`, // Very light version of theme color
        borderBottom: `1px solid ${coverColor}30`
      }}
    >
      <Button 
        variant={isDarkTheme ? "contrast" : "ghost"}
        size="icon" 
        onClick={() => navigate("/dashboard")}
        className="mr-2"
        style={{
          color: textColor
        }}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
        alt="Lansa Logo"
        className="aspect-[2.7] object-contain w-[92px]"
      />
      
      {!readOnly && (
        <ProfileHeaderActions
          userId={userId}
          coverColor={coverColor}
          highlightColor={highlightColor}
          onCoverColorChange={onCoverColorChange}
          onHighlightColorChange={onHighlightColorChange}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
        />
      )}
    </header>
  );
}
