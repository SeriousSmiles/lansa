
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserProfile } from "@/hooks/useProfileData";
import { getSkillsBasedOnAnswers, getExperienceBasedOnRole, getEducationBasedOnAnswers, ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { v4 as uuidv4 } from "@/utils/uuid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SharedProfile() {
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
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
  } | null>(null);
  
  const navigate = useNavigate();
  
  // Convert JSON from database to our typed objects
  const convertJsonToExperienceItems = (jsonData: any): ExperienceItem[] => {
    if (!jsonData || !Array.isArray(jsonData)) return [];
    
    return jsonData.map((item: any) => ({
      id: item.id || uuidv4(),
      title: item.title || "",
      description: item.description || ""
    }));
  };
  
  const convertJsonToEducationItems = (jsonData: any): EducationItem[] => {
    if (!jsonData || !Array.isArray(jsonData)) return [];
    
    return jsonData.map((item: any) => ({
      id: item.id || uuidv4(),
      title: item.title || "",
      description: item.description || ""
    }));
  };

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
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        // Create a properly typed profile object
        const profile = {
          userProfile: profileData || null,
          userName: profileData?.name || userId.split('@')[0],
          role: getProfileRole(answers?.question1),
          goal: getProfileGoal(answers?.question3),
          aboutText: profileData?.about_text || "",
          userSkills: [] as string[],
          experiences: [] as ExperienceItem[],
          educationItems: [] as EducationItem[],
          coverColor: profileData?.cover_color || "#1A1F71",
          profileImage: profileData?.profile_image || ""
        };
        
        // Set skills
        if (profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
          profile.userSkills = profileData.skills;
        } else if (answers) {
          // Fall back to generated skills if not in profile
          profile.userSkills = getSkillsBasedOnAnswers(answers);
        }
        
        // Set experiences - properly handle JSON data from database
        if (profileData?.experiences) {
          try {
            // Parse if it's a string, or use directly if it's already an array
            const experiencesData = typeof profileData.experiences === 'string' 
              ? JSON.parse(profileData.experiences) 
              : profileData.experiences;
              
            if (Array.isArray(experiencesData) && experiencesData.length > 0) {
              profile.experiences = convertJsonToExperienceItems(experiencesData);
            } else {
              throw new Error("Experiences data is not in the expected format");
            }
          } catch (error) {
            console.error("Error parsing experiences data:", error);
            // Fall back to generated experiences on parse error
            const role = getProfileRole(answers?.question1);
            profile.experiences = getExperienceBasedOnRole(role).map(exp => ({
              ...exp,
              id: uuidv4()
            }));
          }
        } else {
          // Fall back to generated experiences if no experiences data
          const role = getProfileRole(answers?.question1);
          profile.experiences = getExperienceBasedOnRole(role).map(exp => ({
            ...exp,
            id: uuidv4()
          }));
        }
        
        // Set education - properly handle JSON data from database
        if (profileData?.education) {
          try {
            // Parse if it's a string, or use directly if it's already an array
            const educationData = typeof profileData.education === 'string'
              ? JSON.parse(profileData.education)
              : profileData.education;
              
            if (Array.isArray(educationData) && educationData.length > 0) {
              profile.educationItems = convertJsonToEducationItems(educationData);
            } else {
              throw new Error("Education data is not in the expected format");
            }
          } catch (error) {
            console.error("Error parsing education data:", error);
            // Fall back to generated education on parse error
            const goal = getProfileGoal(answers?.question3);
            profile.educationItems = getEducationBasedOnAnswers(answers, goal).map(edu => ({
              ...edu,
              id: uuidv4()
            }));
          }
        } else {
          // Fall back to generated education if no education data
          const goal = getProfileGoal(answers?.question3);
          profile.educationItems = getEducationBasedOnAnswers(answers, goal).map(edu => ({
            ...edu,
            id: uuidv4()
          }));
        }
        
        setProfileData(profile);
      } catch (error) {
        console.error("Error loading shared profile data:", error);
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading profile...</div>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] mb-4">Profile not found</div>
        <Button onClick={() => navigate("/auth")}>Return to Login</Button>
      </div>
    );
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
          {/* Left Column - Sidebar (readonly) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Profile Image */}
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="text-2xl font-semibold mb-4">{profileData.userName}</div>
              <div className="text-gray-600 mb-2">{profileData.role}</div>
              
              {profileData.profileImage && (
                <div className="mb-4">
                  <img 
                    src={profileData.profileImage} 
                    alt={`${profileData.userName}'s profile`}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow" 
                  />
                </div>
              )}
              
              {/* Skills */}
              {profileData.userSkills.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.userSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-[#f2f2f2] text-[#333] px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Goal */}
              {profileData.goal && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Professional Goal</h3>
                  <p className="text-gray-700">{profileData.goal}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Experience & Education (readonly) */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me */}
            {profileData.aboutText && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                <p className="text-gray-700">{profileData.aboutText}</p>
              </div>
            )}
            
            {/* Experience */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-semibold mb-4">Experience</h2>
              {profileData.experiences.map((exp) => (
                <div key={exp.id} className="mb-4 last:mb-0">
                  <h3 className="text-lg font-medium">{exp.title}</h3>
                  <p className="text-gray-700">{exp.description}</p>
                </div>
              ))}
            </div>
            
            {/* Education */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-semibold mb-4">Education</h2>
              {profileData.educationItems.map((edu) => (
                <div key={edu.id} className="mb-4 last:mb-0">
                  <h3 className="text-lg font-medium">{edu.title}</h3>
                  <p className="text-gray-700">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa N.V.
      </footer>
    </div>
  );
}
