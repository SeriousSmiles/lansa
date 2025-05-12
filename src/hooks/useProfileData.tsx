
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { useToast } from "@/hooks/use-toast";
import { useProfileBasics } from "./profile/useProfileBasics";
import { useProfileSkills } from "./profile/useProfileSkills";
import { useProfileExperience } from "./profile/useProfileExperience";
import { useProfileEducation } from "./profile/useProfileEducation";
import { useProfileImage } from "./profile/useProfileImage";
import { 
  UserProfile, 
  ProfileDataReturn 
} from "./profile/profileTypes";
import { 
  populateFromExistingProfile,
  populateFromGeneratedData,
  handleProfileLoadError
} from "./profile/profileLoaders";

// Using 'export type' instead of 'export' for TypeScript types
export type { UserProfile, ProfileDataReturn } from "./profile/profileTypes";

export function useProfileData(userId: string | undefined): ProfileDataReturn {
  // Base state
  const [userAnswers, setUserAnswers] = useState<any>(null);
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
      handleProfileLoadError(answers, profileSkills, profileExperience, profileEducation);
    }
    
    setIsLoading(false);
  };

  // Load profile from the database
  const loadProfileFromDatabase = async (answers: any) => {
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
      populateFromExistingProfile(profileData, answers, profileBasics, profileSkills, profileExperience, profileEducation, profileImage);
    } else {
      // If no profile exists, use generated data
      populateFromGeneratedData(answers, userId, profileBasics, profileSkills, profileExperience, profileEducation);
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
