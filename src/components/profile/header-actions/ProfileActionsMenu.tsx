import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PDFDownloadButton } from "../../pdf/PDFDownloadButton";
import { IconPalette, IconShare, IconEye, IconDownload, IconMenu2, IconGlobe, IconSettings } from "@tabler/icons-react";
import { ThemeColorPicker } from "../dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "../dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "../dialogs/ShareProfileDialog";
import { ProfilePreviewModal } from "../dialogs/ProfilePreviewModal";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileActionsMenuProps {
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

export function ProfileActionsMenu({
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
}: ProfileActionsMenuProps) {
  const { user } = useAuth();
  const { userType } = useUserType();
  const profileData = useProfileData(userId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [isUpdatingPublicStatus, setIsUpdatingPublicStatus] = useState(false);

  // Check if user is Lansa certified (you may need to adjust this logic based on your certification system)
  const isLansaCertified = userProfile?.certifications?.some((cert: any) => 
    cert.name?.toLowerCase().includes('lansa') || cert.organization?.toLowerCase().includes('lansa')
  ) || false;

  const {
    isColorPickerOpen,
    setIsColorPickerOpen,
    isHighlightPickerOpen,
    setIsHighlightPickerOpen,
    isShareDialogOpen,
    setIsShareDialogOpen,
    shareUrl,
    selectedColor,
    selectedHighlightColor,
    handleColorSelect,
    handleHighlightColorSelect,
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
      // For now, we'll use user_answers table to store public status
      // You may need to create a proper profiles table later
      const { error } = await supabase
        .from('user_answers')
        .upsert({ 
          user_id: user?.id, 
          is_profile_public: !isProfilePublic 
        }, {
          onConflict: 'user_id'
        });

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
      {/* Share Profile - Standalone prominent button */}
      <Button
        onClick={handleShare}
        variant="primary"
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <IconShare className="h-4 w-4 mr-2" />
        Share Profile
      </Button>

      {/* Burger Menu */}
      <DropdownMenu>
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
        <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-50">
          <DropdownMenuItem onClick={() => setIsColorPickerOpen(true)}>
            <IconPalette className="h-4 w-4 mr-2" />
            Change Theme
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsHighlightPickerOpen(true)}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4 mr-2"
            >
              <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
              <path d="M16 19h6" />
              <path d="M19 16v6" />
            </svg>
            Change Highlights
          </DropdownMenuItem>

          {userType === 'job_seeker' && (
            <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
              <IconEye className="h-4 w-4 mr-2" />
              Preview Card
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => onOpenGuidedSetup?.()}>
            <IconSettings className="h-4 w-4 mr-2" />
            Fill with Guide
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={handleMakeProfilePublic}
            disabled={!isLansaCertified || isUpdatingPublicStatus}
            className={!isLansaCertified ? "opacity-50 cursor-not-allowed" : ""}
          >
            <IconGlobe className="h-4 w-4 mr-2" />
            {isProfilePublic ? "Make Profile Private" : "Make Profile Public"}
            {!isLansaCertified && <span className="ml-auto text-xs text-muted-foreground">Lansa Only</span>}
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

      {/* Dialogs */}
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

      <ThemeColorPicker
        isOpen={isColorPickerOpen}
        onOpenChange={setIsColorPickerOpen}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        title="Select Theme Color"
        description="Choose a color for your profile theme"
      />

      <HighlightColorPicker
        isOpen={isHighlightPickerOpen}
        onOpenChange={setIsHighlightPickerOpen}
        selectedColor={selectedHighlightColor}
        onColorSelect={handleHighlightColorSelect}
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