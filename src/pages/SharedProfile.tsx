import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserProfile } from "@/hooks/useProfileData";
import { ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileLoadingState } from "@/components/profile/shared/ProfileLoadingState";
import { ProfileNotFound } from "@/components/profile/shared/ProfileNotFound";
import { SharedProfileSidebar } from "@/components/profile/shared/SharedProfileSidebar";
import { SharedProfileContent } from "@/components/profile/shared/SharedProfileContent";
import { processSkillsData, processExperiencesData, processEducationData } from "@/utils/profileDataUtils";

interface SharedProfileData {
  userProfile: UserProfile | null;
  userName: string;
  role: string;
  goal: string;
  aboutText: string;
  userSkills: string[];
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
  coverColor: string;
  profileImage: string;
}

export default function SharedProfile() {
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<SharedProfileData | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to fetch user answers
        const answers = await getUserAnswers(userId);
        
        // Try to fetch the user profile
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
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
          aboutText: profileData?.about_text || "",
          userSkills: processedSkills,
          experiences: processedExperiences,
          educationItems: processedEducation,
          coverColor: profileData?.cover_color || "#1A1F71",
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
  }, [userId]);

  if (isLoading) {
    return <ProfileLoadingState />;
  }
  
  if (!profileData) {
    return <ProfileNotFound />;
  }

  // Create a no-op function that returns a Promise to satisfy the type requirement
  const noop = async (_: string) => {
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <div className="p-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>
      
      <ProfileHeader 
        userName={profileData.userName} 
        role={profileData.role} 
        user={{ id: userId }}
        coverColor={profileData.coverColor}
        onCoverColorChange={noop}
        readOnly={true}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Sidebar */}
          <SharedProfileSidebar 
            userName={profileData.userName}
            role={profileData.role}
            goal={profileData.goal}
            userSkills={profileData.userSkills}
            profileImage={profileData.profileImage}
          />
          
          {/* Right Column - Content */}
          <SharedProfileContent 
            aboutText={profileData.aboutText}
            experiences={profileData.experiences}
            educationItems={profileData.educationItems}
          />
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa N.V.
      </footer>
    </div>
  );
}
