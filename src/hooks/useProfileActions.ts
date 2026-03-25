
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackUserAction } from "@/services/actionTracking";

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
  
  const handleShare = async () => {
    if (!userId) return;

    try {
      // Mark profile as public before sharing
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_public: true })
        .eq('user_id', userId);
      if (error) {
        console.error('Failed to mark profile as public:', error);
      } else {
        // Track profile_shared — fires assign_user_color scoring via DB trigger
        await trackUserAction('profile_shared', { user_id: userId });
      }
    } catch (e) {
      console.error('Error updating profile visibility:', e);
    }
    
    const urlFriendlyName = userName 
      ? userName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
      : 'user';
    
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
