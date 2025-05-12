
import { useState } from "react";
import { v4 as uuidv4 } from "@/utils/uuid";
import { UserProfile } from "../useProfileData";
import { ExperienceItem } from "@/utils/profileUtils";

interface UseProfileExperienceProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileExperience({ userId, updateProfileData }: UseProfileExperienceProps) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  // Function to add a new experience
  const addExperience = async (experience: ExperienceItem) => {
    try {
      const newExperience = { ...experience, id: uuidv4() };
      const updatedExperiences = [...experiences, newExperience];
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  // Function to edit an experience
  const editExperience = async (id: string, updatedExperience: ExperienceItem) => {
    try {
      const updatedExperiences = experiences.map(exp => 
        exp.id === id ? { ...updatedExperience, id } : exp
      );
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove an experience
  const removeExperience = async (id: string) => {
    try {
      const updatedExperiences = experiences.filter(exp => exp.id !== id);
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  return {
    experiences,
    setExperiences,
    addExperience,
    editExperience,
    removeExperience
  };
}
