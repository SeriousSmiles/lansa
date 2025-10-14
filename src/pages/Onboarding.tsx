import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserState } from "@/contexts/UserStateProvider";
import { toast } from "sonner";
import { 
  getUserAnswers, 
  saveUserAnswers
} from "@/services/question";
import { UserTypeSelection } from "@/components/onboarding/UserTypeSelection";
import { BusinessOnboardingForm } from "@/components/onboarding/BusinessOnboardingForm";
import { StudentOnboardingContainer } from "@/components/onboarding/student/StudentOnboardingContainer";
import { CareerPathSegmentation, type CareerPath } from "@/components/onboarding/CareerPathSegmentation";
import { AIOnboardingFlow } from "@/components/onboarding/AIOnboardingFlow";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";
import { getPostOnboardingDestination } from "@/services/navigation/onboardingNavigationService";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | null>(null);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [showCareerSegmentation, setShowCareerSegmentation] = useState(false);
  const { user } = useAuth();
  const { hasCompletedOnboarding, loading: userStateLoading, userType: contextUserType } = useUserState();
  const navigate = useNavigate();

  // CRITICAL: Redirect returning users who have already completed onboarding
  useEffect(() => {
    if (!userStateLoading && hasCompletedOnboarding && contextUserType) {
      const destination = getPostOnboardingDestination(contextUserType as any);
      console.log(`User has completed onboarding, redirecting to ${destination}`);
      navigate(destination, { replace: true });
    }
  }, [userStateLoading, hasCompletedOnboarding, contextUserType, navigate]);

  useEffect(() => {
    async function loadUserAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const answers = await getUserAnswers(user.id);
        console.log("Loaded existing user answers:", answers);
        
        if (answers) {
          setUserAnswers(answers);
          
          // Check if user has already selected a type
          if (answers.user_type) {
            setUserType(answers.user_type);
            setShowTypeSelection(false);
            
            // Check if user has already selected career path
            if (answers.career_path) {
              setCareerPath(answers.career_path);
              setShowCareerSegmentation(false);
            } else if (answers.user_type === 'job_seeker') {
              setShowCareerSegmentation(true);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user answers:", error);
        toast.error("Failed to load your data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    loadUserAnswers();
  }, [user, navigate]);

  const handleUserTypeSelect = (selectedType: 'job_seeker' | 'employer') => {
    setUserType(selectedType);
    setShowTypeSelection(false);
    
    // Show career segmentation only for job seekers
    if (selectedType === 'job_seeker') {
      setShowCareerSegmentation(true);
    }
  };

  const handleCareerPathSelect = async (selectedPath: CareerPath) => {
    setCareerPath(selectedPath);
    setShowCareerSegmentation(false);
    
    // Save the career path selection
    if (user?.id) {
      try {
        const updatedAnswers = { 
          ...userAnswers, 
          user_type: userType, 
          career_path: selectedPath 
        };
        await saveUserAnswers(user.id, updatedAnswers);
        setUserAnswers(updatedAnswers);
      } catch (error) {
        console.error("Error saving career path:", error);
        toast.error("Failed to save your career path selection.");
      }
    }
  };

  const handleSaveAnswers = async (userId: string, answers: any) => {
    try {
      const answersWithType = { 
        ...answers, 
        user_type: userType,
        career_path: careerPath 
      };
      const result = await saveUserAnswers(userId, answersWithType);
      if (!result.success) {
        toast.error("Failed to save your answers. Please try again.");
        return { success: false };
      }
      return result;
    } catch (error) {
      console.error("Error in save answers handler:", error);
      toast.error("Failed to save your answers. Please try again.");
      return { success: false };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Setting up your onboarding experience...</div>
      </div>
    );
  }

  return (
    <OnboardingErrorBoundary>
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
        {/* Centered Logo for non-user-type-selection steps */}
        {!showTypeSelection && (
          <header className="flex w-full px-4 md:px-6 py-4 items-center justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
              alt="Lansa Logo"
              className="aspect-[2.7] object-contain w-[92px]"
            />
          </header>
        )}

        <main className="flex-1">
          {showTypeSelection ? (
            <UserTypeSelection onSelect={handleUserTypeSelect} />
          ) : showCareerSegmentation ? (
            <CareerPathSegmentation onSelect={handleCareerPathSelect} />
          ) : userType === 'employer' ? (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <BusinessOnboardingForm onComplete={() => {}} />
            </div>
          ) : userType === 'job_seeker' && careerPath ? (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <StudentOnboardingContainer />
            </div>
          ) : null}
        </main>

        <footer className="text-center py-6 text-sm text-[#1A1F71]">
          © 2025 Lansa
        </footer>
      </div>
    </OnboardingErrorBoundary>
  );
}
