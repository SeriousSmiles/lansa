
import { useState } from "react";
import { v4 as uuidv4 } from "@/utils/uuid";
import { UserProfile } from "../profile/profileTypes";
import { EducationItem } from "../profile/profileTypes";
import { convertEducationItemsToJson, convertJsonToEducationItems } from "@/utils/profileDataConverters";

interface UseProfileEducationProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileEducation({ userId, updateProfileData }: UseProfileEducationProps) {
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);

  // Function to add a new education item
  const addEducation = async (education: EducationItem) => {
    try {
      const newEducation = { ...education, id: uuidv4() };
      const updatedEducation = [...educationItems, newEducation];
      await updateProfileData({ education: convertEducationItemsToJson(updatedEducation) as any });
      setEducationItems(updatedEducation);
    } catch (error) {
      throw error;
    }
  };

  // Function to edit an education item
  const editEducation = async (id: string, updatedEducation: EducationItem) => {
    try {
      const updatedItems = educationItems.map(item => 
        item.id === id ? { ...updatedEducation, id } : item
      );
      await updateProfileData({ education: convertEducationItemsToJson(updatedItems) as any });
      setEducationItems(updatedItems);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove an education item
  const removeEducation = async (id: string) => {
    try {
      const updatedItems = educationItems.filter(item => item.id !== id);
      await updateProfileData({ education: convertEducationItemsToJson(updatedItems) as any });
      setEducationItems(updatedItems);
    } catch (error) {
      throw error;
    }
  };

  return {
    educationItems,
    setEducationItems,
    addEducation,
    editEducation,
    removeEducation
  };
}
