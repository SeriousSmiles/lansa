import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PDFDownloadDialog } from "../../pdf/PDFDownloadDialog";
import { IconPalette, IconDownload, IconMenu2, IconGlobe, IconBolt } from "@tabler/icons-react";
import { DesignerSidebar } from "../dialogs/DesignerSidebar";
import { DesktopQuickActionsModal } from "../dialogs/DesktopQuickActionsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeHandler } from "@/config/demo";
import { useIsMobile } from "@/hooks/use-mobile";
import { LIGHT_PALETTES, DARK_PALETTES } from "@/utils/colorUtils";

interface DesktopProfileActionsProps {
  userId?: string;
  userName?: string;
  coverColor: string;
  highlightColor: string;
  textColor: string;
  isDarkTheme: boolean;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  onActionComplete?: () => void;
  onOpenGuidedSetup?: () => void;
  userProfile?: any;
  // Palette system props
  currentPalette?: string;
  activePalette?: any;
  onPaletteChange?: (paletteId: string) => Promise<void>;
  onModeToggle?: () => Promise<void>;
}

export function DesktopProfileActions({
  userId,
  userName,
  coverColor,
  highlightColor,
  textColor,
  isDarkTheme,
  onCoverColorChange,
  onHighlightColorChange,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile,
  currentPalette,
  activePalette,
  onPaletteChange,
  onModeToggle,
}: DesktopProfileActionsProps) {
  const { user } = useAuth();
  const { userType } = useUserType();
  const profileData = useProfileData(userId);
  const isMobile = useIsMobile();
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [isUpdatingPublicStatus, setIsUpdatingPublicStatus] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if user is Lansa certified
  const isLansaCertified = userProfile?.certifications?.some((cert: any) => 
    cert.name?.toLowerCase().includes('lansa') || cert.organization?.toLowerCase().includes('lansa')
  ) || false;

  const handleMakeProfilePublic = async () => {
    if (!isLansaCertified) {
      toast.error("This feature is only available for Lansa Certified users");
      return;
    }

    setIsUpdatingPublicStatus(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_public: !isProfilePublic })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsProfilePublic(!isProfilePublic);
      toast.success(isProfilePublic ? "Profile is now private" : "Profile is now public and available for matching");
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      toast.error("Failed to update profile visibility");
    } finally {
      setIsUpdatingPublicStatus(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Actions - Standalone prominent button - Hidden on mobile */}
      {!isMobile && (
        <Button
          onClick={() => {
            console.info('[DesktopProfileActions] Quick Actions clicked');
            setIsQuickActionsOpen(true);
          }}
          variant="primary"
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <IconBolt className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      )}

      {/* Actions Menu */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={isDarkTheme ? "contrast" : "outline"} 
            size="sm"
            style={{
              borderColor: `${coverColor}50`,
              color: textColor
            }}
          >
            <IconMenu2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[calc(100vw-2rem)] sm:w-[400px] p-3 sm:p-4 bg-background border border-border z-50"
        >
          {/* Card-based action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Download Resume Card */}
            <PDFDownloadDialog profileData={profileData}>
              <Card 
                className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-border"
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconDownload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center">Download Resume</span>
                </div>
              </Card>
            </PDFDownloadDialog>

            {/* Open Designer Card */}
            <Card 
              className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-border"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsDesignerOpen(true);
              }}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <IconPalette className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-foreground" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-center">Open Designer</span>
              </div>
            </Card>
          </div>

          {/* Visibility Toggle at bottom */}
          <Card className="p-3 sm:p-4 border border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <IconGlobe className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    Profile Visibility
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {isProfilePublic ? "Public" : "Private"} 
                    {!isLansaCertified && " • Lansa Only"}
                  </span>
                </div>
              </div>
              <Switch
                checked={isProfilePublic}
                onCheckedChange={() => {
                  safeHandler(handleMakeProfilePublic, "Make Profile Public")();
                }}
                disabled={!isLansaCertified || isUpdatingPublicStatus}
                className="flex-shrink-0"
              />
            </div>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <DesignerSidebar
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        currentMode={activePalette?.mode || 'light'}
        currentPaletteId={currentPalette || 'coral_professional'}
        onPaletteChange={onPaletteChange || (async () => {})}
        onModeToggle={onModeToggle || (async () => {})}
      />

      <DesktopQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        userName={userName}
      />
    </div>
  );
}