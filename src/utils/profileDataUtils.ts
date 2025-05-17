
import { UserAnswers } from "@/services/question";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { v4 as uuidv4 } from "@/utils/uuid";
import { Json } from "@/integrations/supabase/types";

/**
 * Process skills data from the database
 * @param skillsData - Skills data from the database (can be string JSON or already parsed)
 * @param answers - User answers that might contain skills information
 * @returns Array of skill strings
 */
export function processSkillsData(
  skillsData: string[] | null | undefined,
  answers: UserAnswers | null
): string[] {
  try {
    // If skillsData is already an array, use it
    if (Array.isArray(skillsData)) {
      return skillsData.filter(Boolean);
    }

    // If no skills data, try to extract from answers
    if (answers) {
      const skills: string[] = [];
      // Example: Extract skills from answers (customize based on your questions)
      if (answers.question1 && answers.question1.includes("freelancer")) {
        skills.push("Freelancing");
      }
      if (answers.question2 && answers.question2.includes("industry")) {
        skills.push("Industry Knowledge");
      }
      if (answers.identity === "Freelancer") {
        skills.push("Client Management", "Self-Marketing");
      }
      if (answers.identity === "Job-seeker") {
        skills.push("Resume Building", "Interview Skills");
      }
      if (answers.identity === "Student") {
        skills.push("Academic Focus", "Career Planning");
      }
      if (answers.identity === "Entrepreneur") {
        skills.push("Business Strategy", "Market Analysis");
      }
      if (answers.identity === "Visionary") {
        skills.push("Innovation", "Leadership");
      }
      
      return skills.length > 0 ? skills : ["Professional Development"];
    }

    // Default to empty array if no data available
    return [];
  } catch (error) {
    console.error("Error processing skills data:", error);
    return [];
  }
}

/**
 * Process experiences data from the database
 * @param experiencesData - Experiences data from the database (can be string JSON or already parsed)
 * @param answers - User answers that might contain experience information
 * @returns Array of ExperienceItem objects
 */
export function processExperiencesData(
  experiencesData: Json | null | undefined,
  answers: UserAnswers | null
): ExperienceItem[] {
  try {
    // If experiencesData is a string, try to parse it as JSON
    if (typeof experiencesData === 'string') {
      try {
        const parsed = JSON.parse(experiencesData);
        if (Array.isArray(parsed)) {
          return parsed.map(exp => ensureExperienceFormat(exp));
        }
      } catch (e) {
        console.error("Failed to parse experiences JSON:", e);
        return [];
      }
    }

    // If experiencesData is already an array, ensure each item has the right format
    if (Array.isArray(experiencesData)) {
      return experiencesData.map(exp => ensureExperienceFormat(exp));
    }

    // If no experiences data, try to create a placeholder from answers
    if (answers) {
      // Create placeholder experiences based on identity
      if (answers.identity === "Freelancer") {
        return [{
          id: "placeholder-1",
          title: "Freelance Professional",
          description: "Working with clients to deliver high-quality services while building a professional reputation."
        }];
      }
      
      if (answers.identity === "Job-seeker") {
        return [{
          id: "placeholder-1",
          title: "Career Development",
          description: "Actively pursuing professional growth opportunities aligned with career goals."
        }];
      }
      
      if (answers.identity === "Student") {
        return [{
          id: "placeholder-1",
          title: "Academic Achievement",
          description: "Pursuing educational excellence while developing professional skills."
        }];
      }
      
      if (answers.identity === "Entrepreneur") {
        return [{
          id: "placeholder-1",
          title: "Business Development",
          description: "Building and growing a business concept from idea to implementation."
        }];
      }
      
      if (answers.identity === "Visionary") {
        return [{
          id: "placeholder-1",
          title: "Innovation Leadership",
          description: "Developing groundbreaking ideas and leading initiatives to bring them to life."
        }];
      }
      
      // Legacy fallback
      if (answers.question1 && answers.question1.includes("freelancer")) {
        return [{
          id: "placeholder-1",
          title: "Freelancer",
          description: "Started freelancing career"
        }];
      }
    }

    // Default to empty array if no data available
    return [];
  } catch (error) {
    console.error("Error processing experiences data:", error);
    return [];
  }
}

/**
 * Process education data from the database
 * @param educationData - Education data from the database (can be string JSON or already parsed)
 * @param answers - User answers that might contain education information
 * @returns Array of EducationItem objects
 */
export function processEducationData(
  educationData: Json | null | undefined,
  answers: UserAnswers | null
): EducationItem[] {
  try {
    // If educationData is a string, try to parse it as JSON
    if (typeof educationData === 'string') {
      try {
        const parsed = JSON.parse(educationData);
        if (Array.isArray(parsed)) {
          return parsed.map(edu => ensureEducationFormat(edu));
        }
      } catch (e) {
        console.error("Failed to parse education JSON:", e);
        return [];
      }
    }

    // If educationData is already an array, ensure each item has the right format
    if (Array.isArray(educationData)) {
      return educationData.map(edu => ensureEducationFormat(edu));
    }

    // If no education data, try to create a placeholder from answers
    if (answers) {
      // Create placeholder education based on identity
      if (answers.identity === "Student") {
        return [{
          id: "placeholder-1",
          title: "Current Academic Program",
          description: "Pursuing education with focus on professional development"
        }];
      }
      
      return [{
        id: "placeholder-1",
        title: "Professional Development",
        description: "Continuous learning and skill enhancement"
      }];
    }

    // Default to empty array if no data available
    return [];
  } catch (error) {
    console.error("Error processing education data:", error);
    return [];
  }
}

/**
 * Ensure an experience object has the correct format
 * @param exp - Experience object to format
 * @returns Properly formatted ExperienceItem
 */
function ensureExperienceFormat(exp: any): ExperienceItem {
  return {
    id: exp.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: exp.title || "Position",
    description: exp.description || ""
  };
}

/**
 * Ensure an education object has the correct format
 * @param edu - Education object to format
 * @returns Properly formatted EducationItem
 */
function ensureEducationFormat(edu: any): EducationItem {
  return {
    id: edu.id || `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: edu.title || "Education",
    description: edu.description || ""
  };
}
