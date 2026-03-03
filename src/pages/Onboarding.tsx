import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useUserState } from "@/contexts/UnifiedAuthProvider";
import { toast } from "sonner";
import { 
  getUserAnswers, 
  saveUserAnswers
} from "@/services/question";
import { UserTypeSelection } from "@/components/onboarding/UserTypeSelection";
import { BusinessOnboardingForm } from "@/components/onboarding/BusinessOnboardingForm";
import { OrganizationOnboardingForm } from "@/components/onboarding/OrganizationOnboardingForm";
import { JoinOrganizationFlow } from "@/components/onboarding/JoinOrganizationFlow";
import { StudentOnboardingContainer } from "@/components/onboarding/student/StudentOnboardingContainer";
import { MentorOnboarding } from "@/components/mentor/MentorOnboarding";
import { CareerPathSegmentation, type CareerPath } from "@/components/onboarding/CareerPathSegmentation";
import { AIOnboardingFlow } from "@/components/onboarding/AIOnboardingFlow";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { LansaLoader } from "@/components/shared/LansaLoader";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | 'mentor' | null>(null);
  const [userIntent, setUserIntent] = useState<'job_seeker' | 'create_org' | 'join_org' | 'mentor' | null>(null);
  const [showMentorOnboarding, setShowMentorOnboarding] = useState(false);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [showCareerSegmentation, setShowCareerSegmentation] = useState(false);
  const { user } = useAuth();
  const { refreshUserState } = useUserState();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateAfterOnboarding, isNavigating } = useOnboardingNavigation();

  // Load existing progress — Guard already prevents onboarded users from reaching this page
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
          
          if (answers.user_type) {
            setUserType(answers.user_type);
            
            const savedIntent = answers.onboarding_inputs?.user_intent as 'job_seeker' | 'create_org' | 'join_org' | undefined;
            
            if (savedIntent) {
              setUserIntent(savedIntent);
              setShowTypeSelection(false);
              
              if (answers.career_path) {
                setCareerPath(answers.career_path);
                setShowCareerSegmentation(false);
              } else if (savedIntent === 'job_seeker') {
                setShowCareerSegmentation(true);
              }
            } else {
              setShowTypeSelection(true);
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
  }, [user?.id]);

  const handleUserTypeSelect = async (selectedIntent: 'job_seeker' | 'create_org' | 'join_org' | 'mentor') => {
    setUserIntent(selectedIntent);
    setShowTypeSelection(false);
    
    const mappedUserType = selectedIntent === 'job_seeker' ? 'job_seeker' : selectedIntent === 'mentor' ? 'mentor' : 'employer';
    setUserType(mappedUserType);
    
    if (user?.id) {
      try {
        const updatedAnswers = { 
          ...userAnswers, 
          user_type: mappedUserType,
          onboarding_inputs: {
            ...userAnswers.onboarding_inputs,
            user_intent: selectedIntent
          }
        };
        await saveUserAnswers(user.id, updatedAnswers);
        setUserAnswers(updatedAnswers);
      } catch (error) {
        console.error("Error saving user type:", error);
        toast.error("Failed to save your selection. Please try again.");
      }
    }
    
    if (selectedIntent === 'job_seeker') {
      setShowCareerSegmentation(true);
    } else if (selectedIntent === 'mentor') {
      setShowMentorOnboarding(true);
    }
  };

  const handleBackToTypeSelection = () => {
    setShowTypeSelection(true);
    setUserIntent(null);
    setShowCareerSegmentation(false);
  };

  const handleCareerPathSelect = async (selectedPath: CareerPath) => {
    setCareerPath(selectedPath);
    setShowCareerSegmentation(false);
    
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

  const handleBusinessOnboardingComplete = async () => {
    try {
      console.log("Business onboarding complete, navigating to dashboard...");
      
      if (user?.id) {
        const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
        await markOnboardingComplete(user.id, 'employer');
      }
      
      await navigateAfterOnboarding('employer');
    } catch (error) {
      console.error("Error during post-onboarding navigation:", error);
      toast.error("Navigation failed. Please refresh the page.");
      navigate('/employer-dashboard', { replace: true });
    }
  };

  if (isLoading || isNavigating) {
    return <LansaLoader duration={5000} />;
  }

  return (
    <OnboardingErrorBoundary>
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
        {/* Centered Logo for non-user-type-selection steps (except AIOnboardingFlow which has its own navbar) */}
        {!showTypeSelection && !(userType === 'job_seeker' && careerPath) && (
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
          ) : showMentorOnboarding ? (
            <MentorOnboarding onComplete={async () => {
              if (refreshUserState) {
                await refreshUserState();
              }
              navigate('/mentor-dashboard', { replace: true });
            }} />
          ) : userIntent === 'create_org' ? (
            <OrganizationOnboardingForm onComplete={handleBusinessOnboardingComplete} />
          ) : userIntent === 'join_org' ? (
            <JoinOrganizationFlow 
              onComplete={handleBusinessOnboardingComplete}
              onBack={handleBackToTypeSelection}
            />
          ) : userType === 'job_seeker' && careerPath ? (
            <AIOnboardingFlow />
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <StudentOnboardingContainer />
            </div>
          )}
        </main>

        <footer className="text-center py-6 text-sm text-[#1A1F71]">
          © 2025 Lansa
        </footer>
      </div>
    </OnboardingErrorBoundary>
  );
}
