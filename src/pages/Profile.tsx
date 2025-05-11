
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AboutSection } from "@/components/profile/AboutSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import type { UserAnswers } from "@/utils/profileUtils";

export default function Profile() {
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const [userName, setUserName] = useState<string>("Lansa User");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      // In a real app, you would fetch the user's name from their profile
      // For now we'll use a placeholder
      if (user.email) {
        setUserName(user.email.split('@')[0]);
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";
  const skills = getSkillsBasedOnAnswers(userAnswers);
  const experiences = getExperienceBasedOnRole(role);
  const education = getEducationBasedOnAnswers(userAnswers, goal);

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <ProfileHeader 
        userName={userName} 
        role={role} 
        user={user} 
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - About */}
          <ProfileSidebar 
            userName={userName}
            role={role}
            email={user?.email || ''}
            skills={skills}
            goal={goal}
          />
          
          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me */}
            <AboutSection 
              role={role}
              goal={goal}
              blocker={blocker}
            />
            
            {/* Experience */}
            <ExperienceSection experiences={experiences} />
            
            {/* Education */}
            <EducationSection education={education} />
            
            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="px-8 py-6 h-auto text-lg"
              >
                Return to Dashboard
              </Button>
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
