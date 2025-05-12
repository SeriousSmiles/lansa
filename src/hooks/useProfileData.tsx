
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import type { UserAnswers, ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/utils/uuid";
import { useProfileBasics } from "./profile/useProfileBasics";
import { useProfileSkills } from "./profile/useProfileSkills";
import { useProfileExperience } from "./profile/useProfileExperience";
import { useProfileEducation } from "./profile/useProfileEducation";
import { useProfileImage } from "./profile/useProfileImage";
import { convertJsonToExperienceItems, convertJsonToEducationItems } from "@/utils/profileDataConverters";

// Define interface for profile data
export interface UserProfile {
  user_id?: string;
  name?: string;
  about_text?: string;
  phone_number?: string;
  cover_color?: string;
  highlight_color?: string; // Added highlight_color
  profile_image?: string;
  skills?: string[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileDataReturn {
  // User data
  user: any;
  userName: string;
  setUserName: (name: string) => void;
  userAnswers: UserAnswers | null;
  role: string;
  goal: string;
  blocker: string;
  isLoading: boolean;
  
  // Profile fields
  phoneNumber: string;
  aboutText: string;
  coverColor: string;
  highlightColor: string; // Added highlightColor
  profileImage: string;
  userSkills: string[];
  experiences: ExperienceItem[];
  educationItems: EducationItem[];

  // Update functions
  updateUserName: (name: string) => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  updateCoverColor: (color: string) => Promise<void>;
  updateHighlightColor: (color: string) => Promise<void>; // Added updateHighlightColor
  updateUserAnswer: (field: string, value: string) => Promise<void>;
  
  // Skills functions
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skillToRemove: string) => Promise<void>;
  
  // Experience functions
  addExperience: (experience: ExperienceItem) => Promise<void>;
  editExperience: (id: string, updatedExperience: ExperienceItem) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  
  // Education functions
  addEducation: (education: EducationItem) => Promise<void>;
  editEducation: (id: string, updatedEducation: EducationItem) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  
  // Image upload
  uploadProfileImage: (file: File) => Promise<string>;
}

export function useProfileData(userId: string | undefined): ProfileDataReturn {
  // Base state
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Use specialized hooks
  const profileBasics = useProfileBasics(userId);
  const profileSkills = useProfileSkills({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileExperience = useProfileExperience({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileEducation = useProfileEducation({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileImage = useProfileImage({ userId, updateProfileData: profileBasics.updateProfileData });

  useEffect(() => {
    // Load all profile data
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    if (!userId) return;
    
    // Get user's onboarding answers
    const answers = await getUserAnswers(userId);
    if (answers) {
      setUserAnswers(answers);
    }
    
    try {
      await loadProfileFromDatabase(answers);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data.",
        variant: "destructive",
      });
      
      // If there's an error, set up basic profile data
      handleProfileLoadError(answers);
    }
    
    setIsLoading(false);
  };

  // Load profile from the database
  const loadProfileFromDatabase = async (answers: UserAnswers | null) => {
    if (!userId) return;
    
    // Try to fetch the user profile
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }
    
    if (profileData) {
      // If profile exists, set all the values from it
      populateFromExistingProfile(profileData, answers);
    } else {
      // If no profile exists, use generated data
      populateFromGeneratedData(answers);
    }
  };

  // Populate the profile from existing database data
  const populateFromExistingProfile = (profileData: any, answers: UserAnswers | null) => {
    if (profileData.name) profileBasics.setUserName(profileData.name);
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
      const role = getProfileRole(answers?.question1);
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
      const goal = getProfileGoal(answers?.question3);
      const generatedEducation = getEducationBasedOnAnswers(answers, goal);
      profileEducation.setEducationItems(generatedEducation.map(edu => ({
        ...edu,
        id: uuidv4()
      })));
    }
  };

  // Populate profile with generated data when no profile exists
  const populateFromGeneratedData = (answers: UserAnswers | null) => {
    if (!answers) return;
    
    const role = getProfileRole(answers.question1);
    const goal = getProfileGoal(answers.question3);
    
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
  const handleProfileLoadError = (answers: UserAnswers | null) => {
    if (answers) {
      const role = getProfileRole(answers.question1);
      const goal = getProfileGoal(answers.question3);
      
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

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";

  return {
    // User data
    user: { id: userId },
    userName: profileBasics.userName,
    setUserName: profileBasics.setUserName,
    userAnswers,
    role,
    goal,
    blocker,
    isLoading,
    
    // Profile fields
    phoneNumber: profileBasics.phoneNumber,
    aboutText: profileBasics.aboutText,
    coverColor: profileBasics.coverColor,
    highlightColor: profileBasics.highlightColor,
    profileImage: profileImage.profileImage,
    userSkills: profileSkills.userSkills,
    experiences: profileExperience.experiences,
    educationItems: profileEducation.educationItems,
    
    // Update functions
    updateUserName: profileBasics.updateUserName,
    updatePhoneNumber: profileBasics.updatePhoneNumber,
    updateAboutText: profileBasics.updateAboutText,
    updateCoverColor: profileBasics.updateCoverColor,
    updateHighlightColor: profileBasics.updateHighlightColor,
    updateUserAnswer: profileBasics.updateUserAnswer,
    
    // Skills functions
    addSkill: profileSkills.addSkill,
    removeSkill: profileSkills.removeSkill,
    
    // Experience functions
    addExperience: profileExperience.addExperience,
    editExperience: profileExperience.editExperience,
    removeExperience: profileExperience.removeExperience,
    
    // Education functions
    addEducation: profileEducation.addEducation,
    editEducation: profileEducation.editEducation,
    removeEducation: profileEducation.removeEducation,
    
    // Image upload
    uploadProfileImage: profileImage.uploadProfileImage
  };
}
