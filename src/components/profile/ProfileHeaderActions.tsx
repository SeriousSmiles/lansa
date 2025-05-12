
import { useState } from "react";
import { Palette, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeColorPicker } from "./dialogs/ThemeColorPicker";
import { HighlightColorPicker } from "./dialogs/HighlightColorPicker";
import { ShareProfileDialog } from "./dialogs/ShareProfileDialog";

interface ProfileHeaderActionsProps {
  userId?: string;
  coverColor: string;
  highlightColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  textColor: string;
  isDarkTheme: boolean;
}

export function ProfileHeaderActions({ 
  userId, 
  coverColor, 
  highlightColor,
  onCoverColorChange, 
  onHighlightColorChange, 
  textColor,
  isDarkTheme
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
  };
  
  const handleHighlightColorSelect = async (color: string) => {
    setSelectedHighlightColor(color);
    if (onHighlightColorChange) {
      await onHighlightColorChange(color);
    }
    setIsHighlightPickerOpen(false);
  };
  
  const handleShare = () => {
    if (!userId) return;
    
    // Generate a shareable URL
    const shareableUrl = `${window.location.origin}/profile/share/${userId}`;
    setShareUrl(shareableUrl);
    setIsShareDialogOpen(true);
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button 
        variant={isDarkTheme ? "contrast" : "outline"}
        size="sm" 
        onClick={() => setIsColorPickerOpen(true)}
        className="flex items-center gap-1"
        style={{
          borderColor: `${coverColor}50`,
          color: textColor
        }}
      >
        <Palette className="h-4 w-4" />
        <span>Change Theme</span>
      </Button>
      
      <Button 
        variant={isDarkTheme ? "contrast" : "outline"}
        size="sm" 
        onClick={() => setIsHighlightPickerOpen(true)}
        className="flex items-center gap-1"
        style={{
          borderColor: `${coverColor}50`,
          color: textColor
        }}
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
      </Button>
      
      <Button
        onClick={handleShare}
        variant={isDarkTheme ? "contrast" : "outline"}
        size="sm"
        style={{
          borderColor: `${coverColor}50`,
          color: textColor
        }}
        className="flex items-center gap-1"
      >
        <Share size={16} />
        <span>Share Profile</span>
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
        onOpenChange={setIsShareDialogOpen}
        shareUrl={shareUrl}
      />
    </div>
  );
}
