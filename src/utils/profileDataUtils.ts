import { UserAnswers } from "@/services/QuestionService";
import { ExperienceItem, EducationItem } from "@/utils/profileUtils";

/**
 * Process skills data from the database
 * @param skillsData - Skills data from the database (can be string JSON or already parsed)
 * @param answers - User answers that might contain skills information
 * @returns Array of skill strings
 */
export function processSkillsData(
  skillsData: string | string[] | null | undefined,
  answers: UserAnswers | null
): string[] {
  try {
    // If skillsData is a string, try to parse it as JSON
    if (typeof skillsData === 'string') {
      try {
        const parsed = JSON.parse(skillsData);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean);
        }
      } catch (e) {
        // If parsing fails, it might be a single skill as a string
        return [skillsData];
      }
    }

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
      return skills;
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
  experiencesData: string | any[] | null | undefined,
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
    if (answers && answers.question1) {
      // Example: Create a placeholder experience based on user answers
      if (answers.question1.includes("freelancer")) {
        return [{
          id: "placeholder-1",
          title: "Freelancer",
          company: "Self-employed",
          location: "",
          startDate: new Date().toISOString(),
          endDate: null,
          current: true,
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
  educationData: string | any[] | null | undefined,
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
    if (answers && answers.question1) {
      // Example: Create a placeholder education based on user answers
      if (answers.question1.includes("student")) {
        return [{
          id: "placeholder-1",
          school: "University",
          degree: "Degree",
          field: "Field of Study",
          startDate: new Date().toISOString(),
          endDate: null,
          current: true,
          description: ""
        }];
      }
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
    company: exp.company || "Company",
    location: exp.location || "",
    startDate: exp.startDate || new Date().toISOString(),
    endDate: exp.endDate || null,
    current: exp.current || false,
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
    school: edu.school || "School/University",
    degree: edu.degree || "Degree",
    field: edu.field || "Field of Study",
    startDate: edu.startDate || new Date().toISOString(),
    endDate: edu.endDate || null,
    current: edu.current || false,
    description: edu.description || ""
  };
}
