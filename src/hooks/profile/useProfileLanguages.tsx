import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LanguageItem, UserProfile } from "./profileTypes";
import { v4 as uuidv4 } from "@/utils/uuid";

interface UseProfileLanguagesProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileLanguages({ userId, updateProfileData }: UseProfileLanguagesProps) {
  const [userLanguages, setUserLanguages] = useState<LanguageItem[]>([]);
  const { toast } = useToast();

  // Function to add a new language
  const addLanguage = async (language: LanguageItem) => {
    try {
      const newLanguage = { ...language, id: uuidv4() };
      const updatedLanguages = [...userLanguages, newLanguage];
      await updateProfileData({ languages: updatedLanguages });
      setUserLanguages(updatedLanguages);
      toast({
        title: "Language added",
        description: `${language.name} has been added to your profile.`,
      });
    } catch (error) {
      toast({
        title: "Error adding language",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to edit a language
  const editLanguage = async (id: string, updatedLanguage: LanguageItem) => {
    try {
      const updatedLanguages = userLanguages.map(lang => 
        lang.id === id ? { ...updatedLanguage, id } : lang
      );
      await updateProfileData({ languages: updatedLanguages });
      setUserLanguages(updatedLanguages);
      toast({
        title: "Language updated",
        description: `${updatedLanguage.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error updating language",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to remove a language
  const removeLanguage = async (id: string) => {
    try {
      const languageToRemove = userLanguages.find(lang => lang.id === id);
      const updatedLanguages = userLanguages.filter(lang => lang.id !== id);
      await updateProfileData({ languages: updatedLanguages });
      setUserLanguages(updatedLanguages);
      toast({
        title: "Language removed",
        description: `${languageToRemove?.name || 'Language'} has been removed from your profile.`,
      });
    } catch (error) {
      toast({
        title: "Error removing language",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    userLanguages,
    setUserLanguages,
    addLanguage,
    editLanguage,
    removeLanguage
  };
}