
import { ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { v4 as uuidv4 } from "@/utils/uuid";
import { Json } from "@/integrations/supabase/types";

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
 * Convert typed experience objects to JSON format for database storage
 */
export const convertExperienceItemsToJson = (items: ExperienceItem[]): Json => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
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

/**
 * Convert typed education objects to JSON format for database storage
 */
export const convertEducationItemsToJson = (items: EducationItem[]): Json => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};

/**
 * Convert string array to proper skills format
 */
export const convertToSkillsArray = (skills: string[] | null | undefined): string[] => {
  if (!skills) return [];
  if (!Array.isArray(skills)) return [];
  
  return skills.filter(Boolean);
};

/**
 * Safely parse JSON string or return default value
 */
export const safelyParseJson = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
};

/**
 * Convert any database value to a string with default
 */
export const convertToString = (value: any, defaultValue: string = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

/**
 * Convert any database value to a number with default
 */
export const convertToNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Ensure a value is a valid color code
 */
export const ensureValidColor = (color: string | null | undefined, defaultColor: string = "#FF6B4A"): string => {
  if (!color) return defaultColor;
  
  // Simple check if it looks like a valid hex color
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color) ? color : defaultColor;
};
