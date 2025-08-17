
import { ProfileActionButton } from "../buttons/ProfileActionButton";
import { PDFDownloadButton } from "../../pdf/PDFDownloadButton";
import { IconPalette, IconShare, IconEye, IconDownload } from "@tabler/icons-react";
import { useProfileData } from "@/hooks/useProfileData";
import { ThemeColorPicker } from "../dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "../dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "../dialogs/ShareProfileDialog";
import { ProfilePreviewModal } from "../dialogs/ProfilePreviewModal";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";

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
  userProfile?: any; // Add profile data for preview
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  return (
    <div className="ml-auto flex items-center gap-2">
      <ProfileActionButton
        onClick={() => setIsColorPickerOpen(true)}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
        >
          <IconPalette className="h-4 w-4" />
          <span>Change Theme</span>
      </ProfileActionButton>
      
      {userType === 'job_seeker' && (
        <ProfileActionButton
          onClick={() => setIsPreviewOpen(true)}
          textColor={textColor}
          coverColor={coverColor}
          isDarkTheme={isDarkTheme}
        >
          <IconEye className="h-4 w-4" />
          <span>Preview Card</span>
        </ProfileActionButton>
      )}
      
      <ProfileActionButton
        onClick={() => setIsHighlightPickerOpen(true)}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
      >
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
          className="h-4 w-4"
        >
          <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
          <path d="M16 19h6" />
          <path d="M19 16v6" />
        </svg>
        <span>Change Highlights</span>
      </ProfileActionButton>
      
      <ProfileActionButton
        onClick={() => onOpenGuidedSetup?.()}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M12 2v4" />
          <path d="M20 12h-4" />
          <path d="M4 12h4" />
          <path d="M12 18v4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>Fill with Guide</span>
      </ProfileActionButton>
      
      
      {/* PDF Download Button */}
      <PDFDownloadButton
        profileData={profileData}
        variant="outline"
        style={{
          borderColor: textColor,
          color: textColor,
          backgroundColor: 'transparent'
        }}
      >
        <IconDownload className="h-4 w-4 mr-2" />
        <span>Download Resume</span>
      </PDFDownloadButton>
      
      <ProfileActionButton
        onClick={handleShare}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
        >
          <IconShare size={16} />
          <span>Share Profile</span>
      </ProfileActionButton>
      
      
      {/* Create preview profile data */}
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
      
      {/* Dialog Components */}
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
