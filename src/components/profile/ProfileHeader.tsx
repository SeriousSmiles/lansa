
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
  onOpenGuidedSetup
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
        className={`aspect-[2.7] object-contain w-[80px] sm:w-[92px] flex-shrink-0 ${!hideBackButton ? "" : "ml-0"}`}
      />
      
      {isMobile && !readOnly ? (
        <>
          <Button
            variant={isDarkTheme ? "contrast" : "ghost"}
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="ml-auto flex-shrink-0"
            style={{
              color: textColor
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-4 pt-6">
                <h3 className="text-lg font-medium">Profile Actions</h3>
                <ProfileHeaderActions
                  userId={userId}
                  userName={userName}
                  coverColor={coverColor}
                  highlightColor={highlightColor}
                  onCoverColorChange={onCoverColorChange}
                  onHighlightColorChange={onHighlightColorChange}
                  textColor={textColor}
                  isDarkTheme={isDarkTheme}
                  isMobile={true}
                  onActionComplete={() => setMobileMenuOpen(false)}
                  onOpenGuidedSetup={onOpenGuidedSetup}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        !readOnly && (
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
              isMobile={false}
              onOpenGuidedSetup={onOpenGuidedSetup}
            />
          </div>
        )
      )}
    </header>
  );
}
