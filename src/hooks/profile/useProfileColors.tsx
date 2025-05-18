
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";

interface UseProfileColorsProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileColors({ userId, updateProfileData }: UseProfileColorsProps) {
  const [coverColor, setCoverColor] = useState<string>("#FF6B4A");
  const [highlightColor, setHighlightColor] = useState<string>("#FF6B4A");
  const { toast } = useToast();

  // Function to update cover color
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
  
  // Function to update highlight color
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
    coverColor,
    setCoverColor,
    highlightColor,
    setHighlightColor,
    updateCoverColor,
    updateHighlightColor
  };
}
