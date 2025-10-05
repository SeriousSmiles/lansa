
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/question";
import { useToast } from "@/hooks/use-toast";
import { useProfileBasics } from "./profile/useProfileBasics";
import { useProfileSkills } from "./profile/useProfileSkills";
import { useProfileLanguages } from "./profile/useProfileLanguages";
import { useProfileCertifications } from "./profile/useProfileCertifications";
import { useProfileProjects } from "./profile/useProfileProjects";
import { useProfileAchievements } from "./profile/useProfileAchievements";
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
  const [professionalGoal, setProfessionalGoal] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const { toast } = useToast();
  
  // Prevent duplicate fetches and race conditions
  const isFetchingRef = useRef(false);
  
  // Use specialized hooks
  const profileBasics = useProfileBasics(userId);
  const profileSkills = useProfileSkills({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileLanguages = useProfileLanguages({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileCertifications = useProfileCertifications({ userId });
  const profileProjects = useProfileProjects({ userId });
  const profileAchievements = useProfileAchievements({ userId });
  const profileExperience = useProfileExperience({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileEducation = useProfileEducation({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileImage = useProfileImage({ userId, updateProfileData: profileBasics.updateProfileData });

  useEffect(() => {
    // Load all profile data
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    if (!userId || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    
    // Get user's onboarding answers
    const answers = await getUserAnswers(userId);
    if (answers) {
      setUserAnswers(answers);
    }
    
    try {
      await loadProfileFromDatabase(answers);
      // Fetch certifications, projects, and achievements from database
      await profileCertifications.fetchCertifications();
      await profileProjects.fetchProjects();
      await profileAchievements.fetchAchievements();
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data.",
        variant: "destructive",
      });
      
      // If there's an error, set up basic profile data
      handleProfileLoadError(answers, profileSkills, profileExperience, profileEducation);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Load profile from the database
  const loadProfileFromDatabase = async (answers: any) => {
    if (!userId) return;
    
    // Try to fetch the user profile
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    if (profileData) {
      // If profile exists, set all the values from it
      populateFromExistingProfile(profileData, answers, profileBasics, profileSkills, profileLanguages, profileExperience, profileEducation, profileImage);
      setProfessionalGoal(profileData.professional_goal || "");
      setBiggestChallenge(profileData.biggest_challenge || "Identifying my unique value proposition");
    } else {
      // If no profile exists, use generated data
      populateFromGeneratedData(answers, userId, profileBasics, profileSkills, profileLanguages, profileExperience, profileEducation);
      setBiggestChallenge("Identifying my unique value proposition");
    }
  };

  // Function to update professional goal
  const updateProfessionalGoal = async (goal: string) => {
    try {
      await profileBasics.updateProfileData({ professional_goal: goal });
      setProfessionalGoal(goal);
      toast({
        title: "Professional goal updated",
        description: "Your professional goal has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating goal",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update biggest challenge
  const updateBiggestChallenge = async (challenge: string) => {
    try {
      await profileBasics.updateProfileData({ biggest_challenge: challenge });
      setBiggestChallenge(challenge);
      toast({
        title: "Biggest challenge updated",
        description: "Your biggest challenge has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating challenge",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const role = getProfileRole(userAnswers?.identity, userAnswers?.career_path);
  const goal = getProfileGoal(userAnswers?.desired_outcome);
  const blocker = biggestChallenge || "Identifying my unique value proposition";

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
    userLanguages: profileLanguages.userLanguages,
    userCertifications: profileCertifications.userCertifications,
    userProjects: profileProjects.userProjects,
    userAchievements: profileAchievements.userAchievements,
    experiences: profileExperience.experiences,
    educationItems: profileEducation.educationItems,
    userEmail: profileBasics.userEmail,
    userTitle: profileBasics.userTitle,
    professionalGoal,
    biggestChallenge,
    location: profileBasics.location,
    
    // Update functions
    updateUserName: profileBasics.updateUserName,
    updatePhoneNumber: profileBasics.updatePhoneNumber,
    updateAboutText: profileBasics.updateAboutText,
    updateCoverColor: profileBasics.updateCoverColor,
    updateHighlightColor: profileBasics.updateHighlightColor,
    updateUserAnswer: profileBasics.updateUserAnswer,
    updateUserEmail: profileBasics.updateUserEmail,
    updateUserTitle: profileBasics.updateUserTitle,
    updateProfessionalGoal,
    updateBiggestChallenge,
    updateLocation: profileBasics.updateLocation,
    
    // Skills functions
    addSkill: profileSkills.addSkill,
    removeSkill: profileSkills.removeSkill,
    
    // Language functions
    addLanguage: profileLanguages.addLanguage,
    editLanguage: profileLanguages.editLanguage,
    removeLanguage: profileLanguages.removeLanguage,
    
    // Certification functions
    addCertification: profileCertifications.addCertification,
    editCertification: profileCertifications.editCertification,
    removeCertification: profileCertifications.removeCertification,
    
    // Project functions
    addProject: profileProjects.addProject,
    editProject: profileProjects.editProject,
    removeProject: profileProjects.removeProject,
    
    // Achievement functions
    addAchievement: profileAchievements.addAchievement,
    editAchievement: profileAchievements.editAchievement,
    removeAchievement: profileAchievements.removeAchievement,
    
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
