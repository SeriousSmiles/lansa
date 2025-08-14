
import { Button } from "@/components/ui/button";
import { Palette, Share, Eye } from "lucide-react";
import { ThemeColorPicker } from "../dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "../dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "../dialogs/ShareProfileDialog";
import { ProfilePreviewModal } from "../dialogs/ProfilePreviewModal";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";

interface MobileProfileActionsProps {
  userId?: string;
  userName?: string;
  coverColor: string;
  highlightColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  onActionComplete?: () => void;
  onOpenGuidedSetup?: () => void;
  userProfile?: any; // Add profile data for preview
}

export function MobileProfileActions({
  userId,
  userName,
  coverColor,
  highlightColor,
  onCoverColorChange,
  onHighlightColorChange,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile
}: MobileProfileActionsProps) {
  const { user } = useAuth();
  const { userType } = useUserType();
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
    <div className="flex flex-col w-full gap-3">
      <Button
        onClick={() => setIsColorPickerOpen(true)}
        className="w-full justify-start"
        variant="outline"
      >
        <Palette className="h-4 w-4 mr-2" />
        Change Theme
      </Button>
      
      <Button
        onClick={() => setIsHighlightPickerOpen(true)}
        className="w-full justify-start"
        variant="outline"
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
          className="h-4 w-4 mr-2"
        >
          <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
          <path d="M16 19h6" />
          <path d="M19 16v6" />
        </svg>
        Change Highlights
      </Button>
      
      {userType === 'job_seeker' && (
        <Button
          onClick={() => setIsPreviewOpen(true)}
          className="w-full justify-start"
          variant="outline"
        >
          <Eye size={16} className="mr-2" />
          Preview Card
        </Button>
      )}
      
      <Button
        onClick={handleShare}
        className="w-full justify-start"
        variant="outline"
      >
        <Share size={16} className="mr-2" />
        Share Profile
      </Button>
      
      <Button
        onClick={() => onOpenGuidedSetup?.()}
        className="w-full justify-start"
        variant="outline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
          <path d="M12 2v4" />
          <path d="M20 12h-4" />
          <path d="M4 12h4" />
          <path d="M12 18v4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Fill with Guide
      </Button>
      
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
