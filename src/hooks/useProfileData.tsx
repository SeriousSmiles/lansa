
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/question";
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
  const [professionalGoal, setProfessionalGoal] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  
  // Debug logging for userId
  console.log("🔍 useProfileData called with userId:", userId);
  
  // Use specialized hooks
  const profileBasics = useProfileBasics(userId);
  const profileSkills = useProfileSkills({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileExperience = useProfileExperience({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileEducation = useProfileEducation({ userId, updateProfileData: profileBasics.updateProfileData });
  const profileImage = useProfileImage({ userId, updateProfileData: profileBasics.updateProfileData });

  useEffect(() => {
    // Only load data once per userId
    if (!userId || hasInitialized) return;
    
    console.log("🚀 Loading profile data for userId:", userId);
    loadProfileData();
  }, [userId, hasInitialized]);

  const loadProfileData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      console.log("📥 Getting user answers...");
      // Get user's onboarding answers
      const answers = await getUserAnswers(userId);
      if (answers) {
        setUserAnswers(answers);
        console.log("✅ User answers loaded:", answers);
      }
      
      await loadProfileFromDatabase(answers);
      setHasInitialized(true);
    } catch (error) {
      console.error("❌ Error loading profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data.",
        variant: "destructive",
      });
      
      // If there's an error, set up basic profile data
      const answers = await getUserAnswers(userId);
      handleProfileLoadError(answers, profileSkills, profileExperience, profileEducation);
      setHasInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile from the database
  const loadProfileFromDatabase = async (answers: any) => {
    if (!userId) return;
    
    console.log("🔍 Loading profile from database for userId:", userId);
    
    // Try to fetch the user profile
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }
    
    if (profileData) {
      console.log("✅ Profile data found:", profileData);
      // If profile exists, set all the values from it
      populateFromExistingProfile(profileData, answers, profileBasics, profileSkills, profileExperience, profileEducation, profileImage);
      setProfessionalGoal(profileData.professional_goal || "");
      setBiggestChallenge(profileData.biggest_challenge || answers?.question2 || "Identifying my unique value proposition");
    } else {
      console.log("ℹ️ No profile found, using generated data");
      // If no profile exists, use generated data
      populateFromGeneratedData(answers, userId, profileBasics, profileSkills, profileExperience, profileEducation);
      setBiggestChallenge(answers?.question2 || "Identifying my unique value proposition");
    }
  };

  // Function to update professional goal
  const updateProfessionalGoal = async (goal: string) => {
    console.log("🔄 Updating professional goal to:", goal);
    try {
      await profileBasics.updateProfileData({ professional_goal: goal });
      setProfessionalGoal(goal);
      console.log("✅ Professional goal updated successfully");
      toast({
        title: "Professional goal updated",
        description: "Your professional goal has been saved.",
      });
    } catch (error) {
      console.error("❌ Error updating professional goal:", error);
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
    console.log("🔄 Updating biggest challenge to:", challenge);
    try {
      await profileBasics.updateProfileData({ biggest_challenge: challenge });
      setBiggestChallenge(challenge);
      console.log("✅ Biggest challenge updated successfully");
      toast({
        title: "Biggest challenge updated",
        description: "Your biggest challenge has been saved.",
      });
    } catch (error) {
      console.error("❌ Error updating biggest challenge:", error);
      toast({
        title: "Error updating challenge",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = biggestChallenge || userAnswers?.question2 || "Identifying my unique value proposition";

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
    userEmail: profileBasics.userEmail,
    userTitle: profileBasics.userTitle,
    professionalGoal,
    biggestChallenge,
    
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
