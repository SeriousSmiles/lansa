
import { v4 as uuidv4 } from "@/utils/uuid";
import { ExperienceItem, EducationItem, UserAnswers, getSkillsBasedOnAnswers, getExperienceBasedOnRole, getEducationBasedOnAnswers } from "@/utils/profileUtils";
import { getProfileGoal, getProfileRole } from "@/services/QuestionService";

// Convert JSON from database to our typed objects
export const convertJsonToExperienceItems = (jsonData: any): ExperienceItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) {
    // If it's not an array, try to parse it if it's a string
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            id: item.id || uuidv4(),
            title: item.title || "",
            description: item.description || ""
          }));
        }
      } catch (error) {
        console.error("Error parsing experiences JSON:", error);
        return [];
      }
    }
    return [];
  }
  
  return jsonData.map((item: any) => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};

export const convertJsonToEducationItems = (jsonData: any): EducationItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) {
    // If it's not an array, try to parse it if it's a string
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            id: item.id || uuidv4(),
            title: item.title || "",
            description: item.description || ""
          }));
        }
      } catch (error) {
        console.error("Error parsing education JSON:", error);
        return [];
      }
    }
    return [];
  }
  
  return jsonData.map((item: any) => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};

export const processExperiencesData = (
  experiences: any, 
  answers: UserAnswers | null
): ExperienceItem[] => {
  if (experiences) {
    try {
      // If experiences is already an array, use it directly
      if (Array.isArray(experiences)) {
        return convertJsonToExperienceItems(experiences);
      }
      
      // If experiences is a JSON string, parse it
      if (typeof experiences === 'string') {
        const parsedExperiences = JSON.parse(experiences);
        if (Array.isArray(parsedExperiences) && parsedExperiences.length > 0) {
          return convertJsonToExperienceItems(parsedExperiences);
        }
      }
      
      // Handle JSONB from PostgreSQL which might be an object
      if (experiences && typeof experiences === 'object') {
        if (Array.isArray(experiences)) {
          return convertJsonToExperienceItems(experiences);
        }
      }
    } catch (error) {
      console.error("Error processing experiences data:", error);
    }
  }
  
  // Fall back to generated experiences
  const role = getProfileRole(answers?.question1);
  return getExperienceBasedOnRole(role).map(exp => ({
    ...exp,
    id: uuidv4()
  }));
};

export const processEducationData = (
  education: any,
  answers: UserAnswers | null
): EducationItem[] => {
  if (education) {
    try {
      // If education is already an array, use it directly
      if (Array.isArray(education)) {
        return convertJsonToEducationItems(education);
      }
      
      // If education is a JSON string, parse it
      if (typeof education === 'string') {
        const parsedEducation = JSON.parse(education);
        if (Array.isArray(parsedEducation) && parsedEducation.length > 0) {
          return convertJsonToEducationItems(parsedEducation);
        }
      }
      
      // Handle JSONB from PostgreSQL which might be an object
      if (education && typeof education === 'object') {
        if (Array.isArray(education)) {
          return convertJsonToEducationItems(education);
        }
      }
    } catch (error) {
      console.error("Error processing education data:", error);
    }
  }
  
  // Fall back to generated education
  const goal = getProfileGoal(answers?.question3);
  return getEducationBasedOnAnswers(answers, goal).map(edu => ({
    ...edu,
    id: uuidv4()
  }));
};

export const processSkillsData = (
  skills: string[] | null,
  answers: UserAnswers | null
): string[] => {
  if (skills && Array.isArray(skills) && skills.length > 0) {
    return skills;
  } else if (answers) {
    // Fall back to generated skills if not in profile
    return getSkillsBasedOnAnswers(answers);
  }
  
  return [];
};
