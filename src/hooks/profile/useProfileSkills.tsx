
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";

interface UseProfileSkillsProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileSkills({ userId, updateProfileData }: UseProfileSkillsProps) {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const { toast } = useToast();

  // Function to add a new skill
  const addSkill = async (skill: string) => {
    try {
      const updatedSkills = [...userSkills, skill];
      await updateProfileData({ skills: updatedSkills });
      setUserSkills(updatedSkills);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove a skill
  const removeSkill = async (skillToRemove: string) => {
    try {
      const updatedSkills = userSkills.filter(skill => skill !== skillToRemove);
      await updateProfileData({ skills: updatedSkills });
      setUserSkills(updatedSkills);
    } catch (error) {
      throw error;
    }
  };

  return {
    userSkills,
    setUserSkills,
    addSkill,
    removeSkill
  };
}
