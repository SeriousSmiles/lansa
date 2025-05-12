
import { ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { v4 as uuidv4 } from "@/utils/uuid";

/**
 * Convert JSON from database to typed experience objects
 */
export const convertJsonToExperienceItems = (jsonData: any): ExperienceItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
  return jsonData.map((item: any) => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};

/**
 * Convert JSON from database to typed education objects
 */
export const convertJsonToEducationItems = (jsonData: any): EducationItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
  return jsonData.map((item: any) => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};
