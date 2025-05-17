
import { ProfileActionButton } from "../buttons/ProfileActionButton";
import { Palette, Share } from "lucide-react";
import { ThemeColorPicker } from "../dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "../dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "../dialogs/ShareProfileDialog";
import { useProfileActions } from "@/hooks/useProfileActions";

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
  onActionComplete
}: DesktopProfileActionsProps) {
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
        <Palette className="h-4 w-4" />
        <span>Change Theme</span>
      </ProfileActionButton>
      
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
        onClick={handleShare}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
      >
        <Share size={16} />
        <span>Share Profile</span>
      </ProfileActionButton>
      
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
