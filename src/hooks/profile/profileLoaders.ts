
import { v4 as uuidv4 } from "@/utils/uuid";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import { 
  getProfileRole, 
  getProfileGoal 
} from "@/services/question";
import { convertJsonToExperienceItems, convertJsonToEducationItems, convertJsonToLanguageItems } from "@/utils/profileDataConverters";

// Populate the profile from existing database data
export const populateFromExistingProfile = (
  profileData: any, 
  answers: any, 
  profileBasics: any,
  profileSkills: any,
  profileLanguages: any,
  profileExperience: any,
  profileEducation: any,
  profileImage: any
) => {
  if (profileData.name) profileBasics.setUserName(profileData.name);
  if (profileData.email) profileBasics.setUserEmail(profileData.email);
  if (profileData.title) profileBasics.setUserTitle(profileData.title);
  if (profileData.phone_number) profileBasics.setPhoneNumber(profileData.phone_number);
  if (profileData.about_text) profileBasics.setAboutText(profileData.about_text);
  if (profileData.cover_color) profileBasics.setCoverColor(profileData.cover_color);
  if (profileData.highlight_color) profileBasics.setHighlightColor(profileData.highlight_color);
  if (profileData.profile_image) profileImage.setProfileImage(profileData.profile_image);
  
  if (profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
    profileSkills.setUserSkills(profileData.skills);
  } else if (answers) {
    // Fall back to generated skills if not in profile
    profileSkills.setUserSkills(getSkillsBasedOnAnswers(answers));
  }
  
  if (profileData.experiences && Array.isArray(profileData.experiences) && profileData.experiences.length > 0) {
    profileExperience.setExperiences(convertJsonToExperienceItems(profileData.experiences));
  } else {
    // Fall back to generated experiences
    const role = getProfileRole(answers?.identity, answers?.career_path);
    const generatedExperiences = getExperienceBasedOnRole(role);
    profileExperience.setExperiences(generatedExperiences.map(exp => ({
      ...exp,
      id: uuidv4()
    })));
  }
  
  if (profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0) {
    profileEducation.setEducationItems(convertJsonToEducationItems(profileData.education));
  } else {
    // Fall back to generated education
    const goal = getProfileGoal(answers?.desired_outcome);
    const generatedEducation = getEducationBasedOnAnswers(answers, goal);
    profileEducation.setEducationItems(generatedEducation.map(edu => ({
      ...edu,
      id: uuidv4()
    })));
  }
  
  // Handle languages
  if (profileData.languages && Array.isArray(profileData.languages) && profileData.languages.length > 0) {
    profileLanguages.setUserLanguages(convertJsonToLanguageItems(profileData.languages));
  }
};

// Populate profile with generated data when no profile exists
export const populateFromGeneratedData = (
  answers: any, 
  userId: string | undefined,
  profileBasics: any,
  profileSkills: any,
  profileLanguages: any,
  profileExperience: any,
  profileEducation: any
) => {
  if (!answers) return;
  
  const role = getProfileRole(answers.identity, answers.career_path);
  const goal = getProfileGoal(answers.desired_outcome);
  
  profileSkills.setUserSkills(getSkillsBasedOnAnswers(answers));
  
  const generatedExperiences = getExperienceBasedOnRole(role);
  profileExperience.setExperiences(generatedExperiences.map(exp => ({
    ...exp,
    id: uuidv4()
  })));
  
  const generatedEducation = getEducationBasedOnAnswers(answers, goal);
  profileEducation.setEducationItems(generatedEducation.map(edu => ({
    ...edu,
    id: uuidv4()
  })));
  
  // In a real app, you would fetch the user's name from their profile
  if (answers && userId) {
    // Use userId instead of user_id from answers
    profileBasics.setUserName(userId.split('@')[0]);
  }
};

// Handle errors when loading profile
export const handleProfileLoadError = (
  answers: any,
  profileSkills: any,
  profileExperience: any,
  profileEducation: any
) => {
  if (answers) {
    const role = getProfileRole(answers.identity, answers.career_path);
    const goal = getProfileGoal(answers.desired_outcome);
    
    profileSkills.setUserSkills(getSkillsBasedOnAnswers(answers));
    profileExperience.setExperiences(getExperienceBasedOnRole(role).map(exp => ({
      ...exp,
      id: uuidv4()
    })));
    profileEducation.setEducationItems(getEducationBasedOnAnswers(answers, goal).map(edu => ({
      ...edu,
      id: uuidv4()
    })));
  }
};
