
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileHeaderActions } from "./ProfileHeaderActions";

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
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance - standard formula for brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors and white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };
  
  const textColor = getContrastTextColor(coverColor);
  // Determine if the theme is dark based on luminance
  const isDarkTheme = textColor === "#FFFFFF";
  
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
