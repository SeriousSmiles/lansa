
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserProfile } from "@/hooks/profile/profileTypes";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/question";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileLoadingState } from "@/components/profile/shared/ProfileLoadingState";
import { ProfileNotFound } from "@/components/profile/shared/ProfileNotFound";
import { ProfileLayout } from "@/components/profile/layout/ProfileLayout";
import { ProfileContent } from "@/components/profile/layout/ProfileContent";
import { ProfileFooter } from "@/components/profile/layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";
import { processSkillsData, processExperiencesData, processEducationData } from "@/utils/profileDataUtils";

interface SharedProfileData {
  userProfile: UserProfile | null;
  userName: string;
  role: string;
  goal: string;
  blocker: string;
  aboutText: string;
  userSkills: string[];
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
  coverColor: string;
  highlightColor: string;
  profileImage: string;
}

export default function SharedProfile() {
  // Updated to handle the new URL format with name-userId
  const { userId: urlParam } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<SharedProfileData | null>(null);
  const navigate = useNavigate();
  const mainContentRef = useElementAnimation();

  useEffect(() => {
    async function loadProfile() {
      if (!urlParam) {
        setIsLoading(false);
        return;
      }
      
      // Extract the actual userId from the URL - userId is everything after the last dash
      const userId = urlParam.includes('-') 
        ? urlParam.substring(urlParam.lastIndexOf('-') + 1) 
        : urlParam;
      
      try {
        // Try to fetch user answers
        const answers = await getUserAnswers(userId);
        
        // Try to fetch the user profile from the public profiles table
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (!profileData) {
          console.log("No profile found for userId:", userId);
          setIsLoading(false);
          return;
        }
        
        console.log("Raw profile data:", profileData);
        
        // Process the profile data to ensure proper types
        const processedExperiences = profileData?.experiences 
          ? processExperiencesData(profileData.experiences, answers)
          : [];
          
        const processedEducation = profileData?.education 
          ? processEducationData(profileData.education, answers)
          : [];
          
        const processedSkills = processSkillsData(profileData?.skills, answers);
        
        // Get proper role and goal based on either legacy or new onboarding answers
        const role = getProfileRole(answers?.question1, answers?.identity);
        const goal = getProfileGoal(answers?.question3, answers?.desired_outcome);
        
        // Create a properly typed profile object
        const profile: SharedProfileData = {
          userProfile: null, // We don't use raw profile data directly to avoid type issues
          userName: profileData?.name || userId.split('@')[0],
          role: role,
          goal: goal,
          blocker: answers?.question2 || "Identifying my unique value proposition",
          aboutText: profileData?.about_text || "",
          userSkills: processedSkills,
          experiences: processedExperiences,
          educationItems: processedEducation,
          coverColor: profileData?.cover_color || "#1A1F71",
          highlightColor: profileData?.highlight_color || "#FF6B4A",
          profileImage: profileData?.profile_image || ""
        };
        
        console.log("Processed profile data:", profile);
        
        setProfileData(profile);
      } catch (error) {
        console.error("Error loading shared profile data:", error);
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [urlParam]);

  if (isLoading) {
    return <ProfileLoadingState />;
  }
  
  if (!profileData) {
    return <ProfileNotFound />;
  }

  // Create no-op functions that correctly match the expected parameter types
  const noopString = async (_: string) => {
    return Promise.resolve();
  };
  
  const noopExperience = async (_: ExperienceItem) => {
    return Promise.resolve();
  };
  
  // Fixed function signature for editExperience
  const noopEditExperience = async (_id: string, _experience: ExperienceItem) => {
    return Promise.resolve();
  };
  
  const noopEducation = async (_: EducationItem) => {
    return Promise.resolve();
  };
  
  // Fixed function signature for editEducation
  const noopEditEducation = async (_id: string, _education: EducationItem) => {
    return Promise.resolve();
  };
  
  const noopFile = async (_: File): Promise<string> => {
    return Promise.resolve("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>
      
      <ProfileLayout 
        userName={profileData.userName} 
        role={profileData.role}
        user={{ id: urlParam }}
        coverColor={profileData.coverColor}
        highlightColor={profileData.highlightColor}
        onCoverColorChange={noopString}
        onHighlightColorChange={noopString}
        mainContentRef={mainContentRef}
        readOnly={true}
      >
        <ProfileContent 
          profile={{
            // Include all required properties from ProfileDataReturn type
            isLoading: false,
            user: { id: urlParam },
            userName: profileData.userName,
            setUserName: () => {},  // Add missing property
            userAnswers: null,      // Add missing property
            role: profileData.role,
            goal: profileData.goal,
            blocker: profileData.blocker,  // Add missing property
            phoneNumber: "",
            aboutText: profileData.aboutText,
            coverColor: profileData.coverColor,
            highlightColor: profileData.highlightColor,
            profileImage: profileData.profileImage,
            userSkills: profileData.userSkills,
            experiences: profileData.experiences,
            educationItems: profileData.educationItems,
            
            // No-op functions for all update methods
            updateUserName: noopString,
            updatePhoneNumber: noopString,
            updateAboutText: noopString,
            updateCoverColor: noopString,
            updateHighlightColor: noopString,
            updateUserAnswer: noopString,
            addSkill: noopString,
            removeSkill: noopString,
            addExperience: noopExperience,
            editExperience: noopEditExperience,
            removeExperience: noopString,
            addEducation: noopEducation,
            editEducation: noopEditEducation,
            removeEducation: noopString,
            uploadProfileImage: noopFile
          }}
          textColor={profileData.coverColor}
          navigate={navigate}
        />
        
        <ProfileFooter coverColor={profileData.coverColor} />
      </ProfileLayout>
    </div>
  );
}
