
import { useState } from "react";
import { Palette, Share } from "lucide-react";
import { ThemeColorPicker } from "./dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "./dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "./dialogs/ShareProfileDialog";
import { ProfileActionButton } from "./buttons/ProfileActionButton";
import { Button } from "@/components/ui/button";

interface ProfileHeaderActionsProps {
  userId?: string;
  coverColor: string;
  highlightColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
  onActionComplete?: () => void;
}

export function ProfileHeaderActions({ 
  userId, 
  coverColor, 
  highlightColor,
  onCoverColorChange, 
  onHighlightColorChange, 
  textColor,
  isDarkTheme,
  isMobile = false,
  onActionComplete
}: ProfileHeaderActionsProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState(coverColor);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(highlightColor);
  
  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
    await onCoverColorChange(color);
    setIsColorPickerOpen(false);
    onActionComplete?.();
  };
  
  const handleHighlightColorSelect = async (color: string) => {
    setSelectedHighlightColor(color);
    if (onHighlightColorChange) {
      await onHighlightColorChange(color);
    }
    setIsHighlightPickerOpen(false);
    onActionComplete?.();
  };
  
  const handleShare = () => {
    if (!userId) return;
    
    // Generate a shareable URL
    const shareableUrl = `${window.location.origin}/profile/share/${userId}`;
    setShareUrl(shareableUrl);
    setIsShareDialogOpen(true);
  };

  const handleShareComplete = () => {
    setIsShareDialogOpen(false);
    onActionComplete?.();
  };

  // For mobile view, display full-width buttons in a column
  if (isMobile) {
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
        
        <Button
          onClick={handleShare}
          className="w-full justify-start"
          variant="outline"
        >
          <Share size={16} className="mr-2" />
          Share Profile
        </Button>
        
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

  // Desktop layout (original)
  return (
    <div className="ml-auto flex items-center gap-2">
      <ProfileActionButton
        onClick={() => setIsColorPickerOpen(true)}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
        className="change-theme-button"
      >
        <Palette className="h-4 w-4" />
        <span>Change Theme</span>
      </ProfileActionButton>
      
      <ProfileActionButton
        onClick={() => setIsHighlightPickerOpen(true)}
        textColor={textColor}
        coverColor={coverColor}
        isDarkTheme={isDarkTheme}
        className="change-highlights-button"
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
        className="share-profile-button"
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
        onOpenChange={setIsShareDialogOpen}
        shareUrl={shareUrl}
      />
    </div>
  );
}
