import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PDFDownloadDialog } from "../../pdf/PDFDownloadDialog";
import { IconPalette, IconDownload, IconMenu2, IconGlobe, IconEye, IconBolt } from "@tabler/icons-react";
import { DesignerSidebar } from "../dialogs/DesignerSidebar";
import { DesktopQuickActionsModal } from "../dialogs/DesktopQuickActionsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useUserState } from "@/contexts/UserStateProvider";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeHandler } from "@/config/demo";
import { useIsMobile } from "@/hooks/use-mobile";

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
  currentPalette?: string;
  activePalette?: any;
  onPaletteChange?: (paletteId: string) => Promise<void>;
  onModeToggle?: () => Promise<void>;
}

export function DesktopProfileActions({
  userId,
  userName,
  coverColor,
  textColor,
  isDarkTheme,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile,
  currentPalette,
  activePalette,
  onPaletteChange,
  onModeToggle,
}: DesktopProfileActionsProps) {
  const { user } = useAuth();
  const { userType } = useUserState();
  const profileData = useProfileData(userId);
  const isMobile = useIsMobile();

  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [visibleToEmployers, setVisibleToEmployers] = useState(false);
  const [isUpdatingEmployer, setIsUpdatingEmployer] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_certifications')
      .select('lansa_certified, verified')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsCertified(!!data?.lansa_certified && !!data?.verified));

    supabase
      .from('user_profiles')
      .select('visible_to_employers')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setVisibleToEmployers(!!data?.visible_to_employers));
  }, [user?.id]);

  const handleToggleShareableLink = async () => {
    setIsUpdatingPublic(true);
    try {
      const newValue = !profileData.isProfilePublic;
      await profileData.updateIsPublic(newValue);
      toast.success(
        newValue
          ? "Profile link is now public — anyone with the link can view it."
          : "Profile link is now private."
      );
    } catch {
      toast.error("Failed to update profile link visibility.");
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  const handleToggleEmployerVisibility = async () => {
    if (!isCertified) return;
    setIsUpdatingEmployer(true);
    try {
      const newValue = !visibleToEmployers;
      const { error } = await supabase
        .from('user_profiles')
        .update({ visible_to_employers: newValue })
        .eq('user_id', user?.id);
      if (error) throw error;
      setVisibleToEmployers(newValue);
      toast.success(
        newValue
          ? "You're now visible to employers in search."
          : "You're no longer visible in employer search."
      );
    } catch {
      toast.error("Failed to update employer visibility.");
    } finally {
      setIsUpdatingEmployer(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isMobile && (
        <Button
          onClick={() => setIsQuickActionsOpen(true)}
          variant="primary"
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <IconBolt className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      )}

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isDarkTheme ? "contrast" : "outline"}
            size="sm"
            style={{ borderColor: `${coverColor}50`, color: textColor }}
          >
            <IconMenu2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[calc(100vw-2rem)] sm:w-[400px] p-3 sm:p-4 bg-background border border-border z-50"
        >
          {/* Primary action cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <PDFDownloadDialog profileData={profileData}>
              <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-border">
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconDownload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center">Download Resume</span>
                </div>
              </Card>
            </PDFDownloadDialog>

            <Card
              className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-border"
              onClick={() => { setIsDropdownOpen(false); setIsDesignerOpen(true); }}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-accent/20 flex items-center justify-center">
                  <IconPalette className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-center">Open Designer</span>
              </div>
            </Card>
          </div>

          {/* Visibility section */}
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
            Visibility Settings
          </p>

          {/* Toggle 1: Shareable profile link — ALL users */}
          <Card className="p-3 sm:p-4 border border-border mb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  profileData.isProfilePublic ? "bg-primary/15" : "bg-muted"
                }`}>
                  <IconGlobe className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                    profileData.isProfilePublic ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    Shareable Profile Link
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {profileData.isProfilePublic
                      ? "On — anyone with the link can view it"
                      : "Off — your profile URL is private"}
                  </span>
                </div>
              </div>
              <Switch
                checked={profileData.isProfilePublic}
                onCheckedChange={handleToggleShareableLink}
                disabled={isUpdatingPublic}
                className="flex-shrink-0"
              />
            </div>
          </Card>

          {/* Toggle 2: Appear to employers — certified users only */}
          {isCertified ? (
            <Card className="p-3 sm:p-4 border border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    visibleToEmployers ? "bg-secondary/20" : "bg-muted"
                  }`}>
                    <IconEye className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                      visibleToEmployers ? "text-secondary-foreground" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      Appear to Employers
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {visibleToEmployers
                        ? "On — employers can find you in search"
                        : "Off — not visible in employer search"}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={visibleToEmployers}
                  onCheckedChange={handleToggleEmployerVisibility}
                  disabled={isUpdatingEmployer}
                  className="flex-shrink-0"
                />
              </div>
            </Card>
          ) : (
            <Card className="p-3 sm:p-4 border border-dashed border-border opacity-60">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <IconEye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Appear to Employers
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    Available after Lansa Certification
                  </span>
                </div>
              </div>
            </Card>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
