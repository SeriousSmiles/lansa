import { useState } from "react";

interface UseProfileActionsProps {
  coverColor: string;
  highlightColor: string;
  userId?: string;
  userName?: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  onActionComplete?: () => void;
}

export function useProfileActions({
  coverColor,
  highlightColor,
  userId,
  userName,
  onCoverColorChange,
  onHighlightColorChange,
  onActionComplete
}: UseProfileActionsProps) {
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
    
    // Format the user name for the URL (remove spaces, lowercase)
    const urlFriendlyName = userName 
      ? userName.toLowerCase().replace(/\s+/g, '-') 
      : 'user';
    
    // Generate a shareable URL with the name-userId format, ensuring the userId is still extractable
    const shareableUrl = `${window.location.origin}/profile/share/${urlFriendlyName}-${userId}`;
    setShareUrl(shareableUrl);
    setIsShareDialogOpen(true);
  };

  const handleShareComplete = () => {
    setIsShareDialogOpen(false);
    onActionComplete?.();
  };
  
  return {
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
    handleShareComplete
  };
}
