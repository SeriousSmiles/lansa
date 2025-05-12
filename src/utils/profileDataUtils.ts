
import { v4 as uuidv4 } from "@/utils/uuid";
import { ExperienceItem, EducationItem, UserAnswers, getSkillsBasedOnAnswers, getExperienceBasedOnRole, getEducationBasedOnAnswers } from "@/utils/profileUtils";
import { getProfileGoal, getProfileRole } from "@/services/QuestionService";

// Convert JSON from database to our typed objects
export const convertJsonToExperienceItems = (jsonData: any): ExperienceItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
  return jsonData.map((item: any) => ({
    id: item.id || uuidv4(),
    title: item.title || "",
    description: item.description || ""
  }));
};

export const convertJsonToEducationItems = (jsonData: any): EducationItem[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
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
      // Parse if it's a string, or use directly if it's already an array
      const experiencesData = typeof experiences === 'string' 
        ? JSON.parse(experiences) 
        : experiences;
        
      if (Array.isArray(experiencesData) && experiencesData.length > 0) {
        return convertJsonToExperienceItems(experiencesData);
      }
    } catch (error) {
      console.error("Error parsing experiences data:", error);
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
      // Parse if it's a string, or use directly if it's already an array
      const educationData = typeof education === 'string'
        ? JSON.parse(education)
        : education;
        
      if (Array.isArray(educationData) && educationData.length > 0) {
        return convertJsonToEducationItems(educationData);
      }
    } catch (error) {
      console.error("Error parsing education data:", error);
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
