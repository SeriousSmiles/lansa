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
import { OrganizationOnboardingForm } from "@/components/onboarding/OrganizationOnboardingForm";
import { JoinOrganizationFlow } from "@/components/onboarding/JoinOrganizationFlow";
import { StudentOnboardingContainer } from "@/components/onboarding/student/StudentOnboardingContainer";
import { CareerPathSegmentation, type CareerPath } from "@/components/onboarding/CareerPathSegmentation";
import { AIOnboardingFlow } from "@/components/onboarding/AIOnboardingFlow";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";
import { getPostOnboardingDestination } from "@/services/navigation/onboardingNavigationService";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | null>(null);
  const [userIntent, setUserIntent] = useState<'job_seeker' | 'create_org' | 'join_org' | null>(null);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [showCareerSegmentation, setShowCareerSegmentation] = useState(false);
  const { user } = useAuth();
  const { hasCompletedOnboarding, loading: userStateLoading, userType: contextUserType } = useUserState();
  const navigate = useNavigate();
  const { navigateAfterOnboarding, isNavigating } = useOnboardingNavigation();

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
            
            // Restore user_intent from onboarding_inputs if available
            const savedIntent = answers.onboarding_inputs?.user_intent as 'job_seeker' | 'create_org' | 'join_org' | undefined;
            
            if (savedIntent) {
              setUserIntent(savedIntent);
              setShowTypeSelection(false);
              
              // Check if user has already selected career path (for job seekers)
              if (answers.career_path) {
                setCareerPath(answers.career_path);
                setShowCareerSegmentation(false);
              } else if (savedIntent === 'job_seeker') {
                setShowCareerSegmentation(true);
              }
            } else {
              // No saved intent - show type selection again
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
  }, [user, navigate]);

  const handleUserTypeSelect = async (selectedIntent: 'job_seeker' | 'create_org' | 'join_org') => {
    setUserIntent(selectedIntent);
    setShowTypeSelection(false);
    
    // Map intent to user_type for database
    const mappedUserType = selectedIntent === 'job_seeker' ? 'job_seeker' : 'employer';
    setUserType(mappedUserType);
    
    // Save user_type AND user_intent to database immediately
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
        console.log("Saved user intent:", selectedIntent);
      } catch (error) {
        console.error("Error saving user type:", error);
        toast.error("Failed to save your selection. Please try again.");
      }
    }
    
    // Handle different intents
    if (selectedIntent === 'job_seeker') {
      // Show career segmentation for job seekers
      setShowCareerSegmentation(true);
    } else if (selectedIntent === 'create_org') {
      // Go directly to organization creation flow
      // This will render the OrganizationOnboardingForm (to be created)
    } else if (selectedIntent === 'join_org') {
      // Go directly to join organization flow
      // This will render the JoinOrganizationFlow (to be created)
    }
  };

  const handleBackToTypeSelection = () => {
    setShowTypeSelection(true);
    setUserIntent(null);
    // Don't reset userType here - keep it so we don't lose the employer status
    setShowCareerSegmentation(false);
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

  const handleBusinessOnboardingComplete = async () => {
    try {
      console.log("Business onboarding complete, navigating to dashboard...");
      
      // Mark onboarding as complete first
      if (user?.id) {
        const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
        await markOnboardingComplete(user.id, 'employer');
      }
      
      await navigateAfterOnboarding('employer');
    } catch (error) {
      console.error("Error during post-onboarding navigation:", error);
      toast.error("Navigation failed. Please refresh the page.");
      // Fallback navigation
      navigate('/employer-dashboard', { replace: true });
    }
  };

  if (isLoading || isNavigating) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">
          {isNavigating ? "Completing setup..." : "Setting up your onboarding experience..."}
        </div>
      </div>
    );
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
