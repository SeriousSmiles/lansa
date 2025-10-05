import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PDFDownloadButton } from "../../pdf/PDFDownloadButton";
import { IconPalette, IconShare, IconEye, IconDownload, IconMenu2, IconGlobe, IconSettings, IconBolt } from "@tabler/icons-react";
import { DesignerSidebar } from "../dialogs/DesignerSidebar";
import { ShareProfileDialog } from "../dialogs/ShareProfileDialog";
import { ProfilePreviewModal } from "../dialogs/ProfilePreviewModal";
import { DesktopQuickActionsModal } from "../dialogs/DesktopQuickActionsModal";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";
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
  userProfile
}: DesktopProfileActionsProps) {
  const { user } = useAuth();
  const { userType } = useUserType();
  const profileData = useProfileData(userId);
  const isMobile = useIsMobile();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [isUpdatingPublicStatus, setIsUpdatingPublicStatus] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if user is Lansa certified
  const isLansaCertified = userProfile?.certifications?.some((cert: any) => 
    cert.name?.toLowerCase().includes('lansa') || cert.organization?.toLowerCase().includes('lansa')
  ) || false;

  const {
    isShareDialogOpen,
    setIsShareDialogOpen,
    shareUrl,
    handleShare,
  } = useProfileActions({
    userId,
    userName,
    coverColor,
    highlightColor,
    onCoverColorChange,
    onHighlightColorChange,
    onActionComplete
  });

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
          className="w-56 bg-background border border-border z-50"
        >
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            handleShare();
          }}>
            <IconShare className="h-4 w-4 mr-2" />
            Share Profile
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            setIsPreviewOpen(true);
          }}>
            <IconEye className="h-4 w-4 mr-2" />
            Preview Profile
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            setIsDesignerOpen(true);
          }}>
            <IconPalette className="h-4 w-4 mr-2" />
            Open Designer
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            onOpenGuidedSetup?.();
          }}>
            <IconSettings className="h-4 w-4 mr-2" />
            Fill with Guide
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault();
              setIsDropdownOpen(false);
              safeHandler(handleMakeProfilePublic, "Make Profile Public")();
            }}
            disabled={!isLansaCertified || isUpdatingPublicStatus}
            className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 ${!isLansaCertified ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center w-full">
              <IconGlobe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">
                {isProfilePublic ? "Make Profile Private" : "Make Profile Public"}
              </span>
            </div>
            {!isLansaCertified && (
              <span className="text-xs text-muted-foreground ml-auto sm:ml-2 whitespace-nowrap">
                Lansa Only
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="p-1">
            <PDFDownloadButton
              profileData={profileData}
              variant="outline"
              size="sm"
              className="w-full justify-start"
              style={{
                borderColor: `${coverColor}50`,
                color: textColor
              }}
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Resume
            </PDFDownloadButton>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals and Dialogs */}
      {userProfile && (
        <ProfilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          profile={{
            user_id: user?.id || '',
            name: userProfile.name || userName || 'Your Name',
            title: userProfile.title || 'Your Professional Title',
            about_text: userProfile.about_text || 'Your professional summary will appear here.',
            profile_image: userProfile.profile_image || '',
            skills: userProfile.skills || [],
            cover_color: coverColor,
            highlight_color: highlightColor,
            professional_goal: userProfile.professional_goal || 'Your career goals will appear here.'
          }}
        />
      )}

      <DesignerSidebar
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        currentTheme={coverColor}
        currentHighlight={highlightColor}
        onThemeChange={onCoverColorChange}
        onHighlightChange={onHighlightColorChange || (() => Promise.resolve())}
      />

      <DesktopQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />

      <ShareProfileDialog
        isOpen={isShareDialogOpen}
        onOpenChange={(open) => {
          setIsShareDialogOpen(open);
          if (!open) onActionComplete?.();
        }}
        shareUrl={shareUrl}
      />
    </div>
  );
}