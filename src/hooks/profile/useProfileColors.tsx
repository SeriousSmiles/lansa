import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ProfilePalette } from "./profileTypes";
import { getPaletteById } from "@/utils/colorUtils";

interface UseProfileColorsProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
  initialPalette?: ProfilePalette;
  initialCoverColor?: string;
  initialHighlightColor?: string;
}

export function useProfileColors({ 
  userId, 
  updateProfileData,
  initialPalette,
  initialCoverColor = "#FF6B4A",
  initialHighlightColor = "#FF6B4A"
}: UseProfileColorsProps) {
  const { toast } = useToast();
  
  // Initialize palette - use existing or default
  const [currentPalette, setCurrentPalette] = useState<ProfilePalette>(
    initialPalette || {
      mode: 'light',
      palette_id: 'coral_professional',
    }
  );
  
  // Legacy color support (backwards compatibility)
  const [coverColor, setCoverColor] = useState<string>(initialCoverColor);
  const [highlightColor, setHighlightColor] = useState<string>(initialHighlightColor);

  // Get the full palette data
  const getActivePalette = () => {
    return getPaletteById(currentPalette.palette_id);
  };

  // Update palette (quick select or custom)
  const updatePalette = async (paletteId: string, customColors?: Partial<ProfilePalette>) => {
    try {
      const newPalette: ProfilePalette = {
        ...currentPalette,
        palette_id: paletteId,
        ...customColors,
      };
      
      await updateProfileData({ 
        color_palette: newPalette,
        // Update legacy fields for backwards compatibility
        highlight_color: getPaletteById(paletteId).primary,
        cover_color: getPaletteById(paletteId).background,
      });
      
      setCurrentPalette(newPalette);
      setHighlightColor(getPaletteById(paletteId).primary);
      setCoverColor(getPaletteById(paletteId).background);
      
      toast({
        title: "Palette updated",
        description: "Your profile colors have been updated.",
      });
    } catch (error) {
      console.error("Error updating palette:", error);
      toast({
        title: "Error updating palette",
        description: "There was an error updating your colors. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Toggle between light and dark mode
  const toggleMode = async () => {
    const newMode = currentPalette.mode === 'light' ? 'dark' : 'light';
    const currentBaseName = currentPalette.palette_id.replace('dark_', '');
    
    // Find equivalent palette in the other mode
    const newPaletteId = newMode === 'dark' 
      ? `dark_${currentBaseName}`
      : currentBaseName;
    
    await updatePalette(newPaletteId);
  };

  // Fine-tune individual colors
  const updateCustomColor = async (colorKey: keyof ProfilePalette, value: string) => {
    try {
      const newPalette = {
        ...currentPalette,
        [colorKey]: value,
      };
      
      await updateProfileData({ color_palette: newPalette });
      setCurrentPalette(newPalette);
      
      const colorKeyString = String(colorKey);
      toast({
        title: "Color updated",
        description: `Your ${colorKeyString} color has been updated.`,
      });
    } catch (error) {
      const colorKeyString = String(colorKey);
      console.error(`Error updating ${colorKeyString}:`, error);
      toast({
        title: "Error updating color",
        description: "There was an error updating your color. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Legacy functions for backwards compatibility
  const updateCoverColor = async (color: string) => {
    try {
      await updateProfileData({ cover_color: color });
      setCoverColor(color);
      toast({
        title: "Theme updated",
        description: "Your profile theme color has been updated.",
      });
    } catch (error) {
      console.error("Error updating cover color:", error);
      toast({
        title: "Error updating theme color",
        description: "There was an error updating your theme color. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateHighlightColor = async (color: string) => {
    try {
      await updateProfileData({ highlight_color: color });
      setHighlightColor(color);
      toast({
        title: "Highlight color updated",
        description: "Your profile highlight color has been updated.",
      });
    } catch (error) {
      console.error("Error updating highlight color:", error);
      toast({
        title: "Error updating highlight color",
        description: "There was an error updating your highlight color. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    // New palette system
    currentPalette,
    activePalette: getActivePalette(),
    updatePalette,
    toggleMode,
    updateCustomColor,
    
    // Legacy support
    coverColor,
    setCoverColor,
    highlightColor,
    setHighlightColor,
    updateCoverColor,
    updateHighlightColor
  };
}
