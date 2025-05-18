
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/question";
import { UserProfile } from "@/hooks/profile/profileTypes";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { processSkillsData, processExperiencesData, processEducationData } from "@/utils/profileDataUtils";

export interface SharedProfileData {
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
  phoneNumber: string;
}

export function useSharedProfileData(urlParam: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<SharedProfileData | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!urlParam) {
        setIsLoading(false);
        return;
      }
      
      console.log("URL parameter received:", urlParam);
      
      // Extract the actual userId from the URL
      // The URL format is expected to be "name-UUID" where UUID is a standard 36-character UUID
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const match = urlParam.match(uuidRegex);
      const userId = match ? match[0] : urlParam;
      
      console.log("Extracted userId:", userId);
      
      try {
        // Fetch the user profile first
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.log("No profile found for userId:", userId);
          setIsLoading(false);
          return;
        }
        
        console.log("Raw profile data:", profileData);

        // Try to fetch user answers (optional)
        let answers = null;
        try {
          answers = await getUserAnswers(userId);
          console.log("User answers:", answers);
        } catch (error) {
          console.error("Error fetching user answers:", error);
          // Continue without answers - use profile data only
        }
        
        // Process the profile data to ensure proper types
        const processedExperiences = profileData?.experiences 
          ? processExperiencesData(profileData.experiences, answers)
          : [];
          
        const processedEducation = profileData?.education 
          ? processEducationData(profileData.education, answers)
          : [];
          
        const processedSkills = processSkillsData(profileData?.skills, answers);
        
        // Get proper role and goal based on either legacy or new onboarding answers
        const role = getProfileRole(answers?.question1, answers?.identity) || 
                    profileData?.identity || "Professional";
                    
        const goal = getProfileGoal(answers?.question3, answers?.desired_outcome) || 
                    profileData?.desired_outcome || "Advance my career";
        
        // Create a properly typed profile object
        const profile: SharedProfileData = {
          userProfile: null,
          userName: profileData?.name || userId.split('@')[0],
          role: role,
          goal: goal,
          blocker: answers?.question2 || profileData?.identity || "Identifying my unique value proposition",
          aboutText: profileData?.about_text || "",
          userSkills: processedSkills,
          experiences: processedExperiences,
          educationItems: processedEducation,
          coverColor: profileData?.cover_color || "#1A1F71",
          highlightColor: profileData?.highlight_color || "#FF6B4A",
          profileImage: profileData?.profile_image || "",
          phoneNumber: profileData?.phone_number || ""
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

  return { isLoading, profileData };
}
