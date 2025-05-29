
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/question";
import { UserProfile } from "@/hooks/profile/profileTypes";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { processSkillsData, processExperiencesData, processEducationData } from "@/utils/profileDataUtils";
import { convertJsonToExperienceItems, convertJsonToEducationItems } from "@/utils/profileDataConverters";

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
  userEmail: string;
  userTitle: string;
  professionalGoal: string;
}

export function useSharedProfileData(urlParam: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<SharedProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Function to extract user ID from URL parameter
  const extractUserId = (param: string | undefined): string | null => {
    if (!param) return null;
    
    // The URL format is expected to be "name-UUID" where UUID is a standard 36-character UUID
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const match = param.match(uuidRegex);
    return match ? match[0] : param;
  };

  // Extract user ID when the URL param changes
  useEffect(() => {
    const extractedId = extractUserId(urlParam);
    setUserId(extractedId);
  }, [urlParam]);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!userId) return;

    // Initial data load
    loadProfile(userId);

    // Real-time subscription
    const channel = supabase
      .channel('public:user_profiles')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Profile updated in real-time:', payload);
          loadProfile(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Primary function to load profile data
  const loadProfile = async (userId: string) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    console.log("Loading profile for userId:", userId);
    
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
        ? convertJsonToExperienceItems(profileData.experiences)
        : [];
        
      const processedEducation = profileData?.education 
        ? convertJsonToEducationItems(profileData.education)
        : [];
        
      const processedSkills = processSkillsData(profileData?.skills, answers);
      
      // Use profile title if available, otherwise fall back to generated role
      const role = profileData?.title || 
                  getProfileRole(answers?.question1, answers?.identity) || 
                  profileData?.identity || "Professional";
      
      // Use profile desired_outcome if available, otherwise fall back to generated goal
      const goal = profileData?.desired_outcome || 
                  getProfileGoal(answers?.question3, answers?.desired_outcome) || 
                  "Advance my career";
      
      // Get blocker from answers.question2 or use a default value
      const blocker = answers?.question2 || "Identifying my unique value proposition";
      
      // Create a properly typed UserProfile object from profileData
      const typedUserProfile: UserProfile = {
        user_id: profileData.user_id,
        name: profileData.name,
        email: profileData.email,
        title: profileData.title,
        about_text: profileData.about_text,
        phone_number: profileData.phone_number,
        cover_color: profileData.cover_color,
        highlight_color: profileData.highlight_color,
        profile_image: profileData.profile_image,
        skills: profileData.skills,
        experiences: processedExperiences,
        education: processedEducation,
        professional_goal: profileData.professional_goal,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };
      
      // Create a properly typed profile object
      const profile: SharedProfileData = {
        userProfile: typedUserProfile,
        userName: profileData?.name || userId.split('@')[0],
        role: role,
        goal: goal,
        blocker: blocker,
        aboutText: profileData?.about_text || "",
        userSkills: processedSkills,
        experiences: processedExperiences,
        educationItems: processedEducation,
        coverColor: profileData?.cover_color || "#1A1F71",
        highlightColor: profileData?.highlight_color || "#FF6B4A",
        profileImage: profileData?.profile_image || "",
        phoneNumber: profileData?.phone_number || "",
        userEmail: profileData?.email || "",
        userTitle: profileData?.title || "",
        professionalGoal: profileData?.professional_goal || ""
      };
      
      console.log("Processed profile data:", profile);
      
      setProfileData(profile);
    } catch (error) {
      console.error("Error loading shared profile data:", error);
    }
    
    setIsLoading(false);
  };

  return { isLoading, profileData };
}
