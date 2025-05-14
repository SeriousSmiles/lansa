
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileHeaderActions } from "./ProfileHeaderActions";
import { getContrastTextColor, isDarkTheme as checkIsDarkTheme } from "@/utils/colorUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

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
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Calculate text contrast color (black or white) based on background
  const textColor = getContrastTextColor(coverColor);
  
  // Determine if the theme is dark based on luminance
  const isDarkTheme = checkIsDarkTheme(coverColor);

  // Check if it's the user's first visit to profile page
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('profile-onboarding-seen');
    
    if (!hasSeenOnboarding && !readOnly) {
      // Show first onboarding step after a short delay
      setTimeout(() => {
        toast({
          title: "Welcome to Your Profile Page!",
          description: "Click the 'Change Theme' button to customize your profile's color theme.",
          duration: 7000,
          className: "onboarding-toast theme-button-tip",
        });
        
        // Show second step after the first one closes
        setTimeout(() => {
          toast({
            title: "Customize Your Highlights",
            description: "Click the 'Change Highlights' button to set your accent colors.",
            duration: 7000,
            className: "onboarding-toast highlight-button-tip",
          });
          
          // Show final step after the second one closes
          setTimeout(() => {
            toast({
              title: "Share Your Profile",
              description: "Use the 'Share Profile' button to generate a link to your public profile.",
              duration: 7000,
              className: "onboarding-toast share-button-tip",
            });
            
            // Mark onboarding as seen
            localStorage.setItem('profile-onboarding-seen', 'true');
          }, 8000);
        }, 8000);
      }, 1000);
    }
  }, [readOnly, toast]);
  
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
      
      {isMobile && !readOnly ? (
        <>
          <Button
            variant={isDarkTheme ? "contrast" : "ghost"}
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="ml-auto"
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
                  coverColor={coverColor}
                  highlightColor={highlightColor}
                  onCoverColorChange={onCoverColorChange}
                  onHighlightColorChange={onHighlightColorChange}
                  textColor={textColor}
                  isDarkTheme={isDarkTheme}
                  isMobile={true}
                  onActionComplete={() => setMobileMenuOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        !readOnly && (
          <ProfileHeaderActions
            userId={userId}
            coverColor={coverColor}
            highlightColor={highlightColor}
            onCoverColorChange={onCoverColorChange}
            onHighlightColorChange={onHighlightColorChange}
            textColor={textColor}
            isDarkTheme={isDarkTheme}
            isMobile={false}
          />
        )
      )}
    </header>
  );
}
