import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/profile/profileTypes";
import { ExperienceItem, EducationItem, LanguageItem } from "@/hooks/profile/profileTypes";
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
  biggestChallenge: string;
  languages: LanguageItem[];
  location: string;
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
      .channel('public:user_profiles_public')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_profiles_public',
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
        .from('user_profiles_public')
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

      // Skip fetching private user_answers on public views
      const answers = null as any;

      
      // Process the profile data to ensure proper types
      const processedExperiences = profileData?.experiences 
        ? convertJsonToExperienceItems(profileData.experiences)
        : [];
        
      const processedEducation = profileData?.education 
        ? convertJsonToEducationItems(profileData.education)
        : [];
        
      const processedSkills = processSkillsData(profileData?.skills, answers);
      
      // Process languages data
      const processedLanguages: LanguageItem[] = profileData?.languages 
        ? (Array.isArray(profileData.languages) ? profileData.languages.map((lang: any) => ({
            id: lang.id,
            name: lang.name,
            level: lang.level
          })) : [])
        : [];
      
      // Determine role and goal from safe sources (avoid sensitive fields)
      const role = profileData?.title || "Professional";
      const goal = profileData?.professional_goal || "Advance my career";
      const blocker = ""; // no blocker on public view

      // Do not include full internal profile object for public view
      const typedUserProfile: UserProfile | null = null;
      
      // Create a properly typed profile object
      const profile: SharedProfileData = {
        userProfile: null,
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
        professionalGoal: profileData?.professional_goal || "",
        biggestChallenge: profileData?.biggest_challenge || "",
        languages: processedLanguages,
        location: profileData?.location || ""
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
