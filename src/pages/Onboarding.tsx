import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useUserState } from "@/contexts/UnifiedAuthProvider";
import { toast } from "sonner";
import { 
  getUserAnswers, 
  saveUserAnswers
} from "@/services/question";
import { UserTypeSelection } from "@/components/onboarding/UserTypeSelection";
import { OrganizationOnboardingForm } from "@/components/onboarding/OrganizationOnboardingForm";
import { JoinOrganizationFlow } from "@/components/onboarding/JoinOrganizationFlow";
import { MentorOnboarding } from "@/components/mentor/MentorOnboarding";
import { CareerPathSegmentation, type CareerPath } from "@/components/onboarding/CareerPathSegmentation";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { LansaLoader } from "@/components/shared/LansaLoader";

// ─── Single state machine — replaces 5 parallel boolean flags ───────────────
// One value can never be contradictory. Adding a new user type = one new union
// member + one switch case. Nothing else changes.
type OnboardingStep =
  | 'type_selection'
  | 'career_path'
  | 'mentor_flow'
  | 'create_org'
  | 'join_org'
  | 'completing';   // async work in progress — shows loader, no flash

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<OnboardingStep>('type_selection');
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | 'mentor' | null>(null);

  // Deferred navigation: navigate only once hasCompletedOnboarding becomes true
  // so Guard on /profile never sees a stale false and flashes back to /onboarding.
  const pendingNavigation = useRef<{ path: string; state?: any } | null>(null);

  const { user } = useAuth();
  const { refreshUserState, hasCompletedOnboarding } = useUserState();
  const navigate = useNavigate();
  const { navigateAfterOnboarding, isNavigating } = useOnboardingNavigation();

  // Fire deferred navigation only after context confirms onboarding is complete
  useEffect(() => {
    if (hasCompletedOnboarding && pendingNavigation.current) {
      const { path, state } = pendingNavigation.current;
      pendingNavigation.current = null;
      navigate(path, { replace: true, state });
    }
  }, [hasCompletedOnboarding, navigate]);

  // Load existing progress on mount
  useEffect(() => {
    async function loadUserAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const answers = await getUserAnswers(user.id);

        if (answers) {
          setUserAnswers(answers);

          if (answers.user_type) {
            setUserType(answers.user_type);

            const savedIntent = answers.onboarding_inputs?.user_intent as
              | 'job_seeker' | 'create_org' | 'join_org' | undefined;

            if (savedIntent) {
              // Recovery path: career_path already saved but onboarding not marked complete
              if (savedIntent === 'job_seeker' && answers.career_path) {
                console.log("Recovery: user has career_path but was stuck — completing onboarding now");
                setStep('completing');
                const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
                await markOnboardingComplete(user.id, 'job_seeker');
                pendingNavigation.current = { path: '/profile', state: { fromOnboarding: true } };
                if (refreshUserState) await refreshUserState();
                return;
              }

              if (savedIntent === 'job_seeker') {
                setStep('career_path');
              } else if (savedIntent === 'create_org') {
                setStep('create_org');
              } else if (savedIntent === 'join_org') {
                setStep('join_org');
              }
            }
            // else: no saved intent → stays at 'type_selection' (default)
          }
        }
      } catch (error) {
        console.error("Error loading user answers:", error);
        toast.error("Failed to load your data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAnswers();
  }, [user?.id]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleUserTypeSelect = async (
    selectedIntent: 'job_seeker' | 'create_org' | 'join_org' | 'mentor'
  ) => {
    const mappedUserType =
      selectedIntent === 'job_seeker' ? 'job_seeker'
      : selectedIntent === 'mentor'   ? 'mentor'
      : 'employer';

    setUserType(mappedUserType);

    // Transition immediately — sync, before any async work, so no render gap
    if (selectedIntent === 'job_seeker') setStep('career_path');
    else if (selectedIntent === 'mentor') setStep('mentor_flow');
    else if (selectedIntent === 'create_org') setStep('create_org');
    else if (selectedIntent === 'join_org') setStep('join_org');

    // Async save AFTER the step is already correct in state
    if (user?.id) {
      try {
        const updatedAnswers = {
          ...userAnswers,
          user_type: mappedUserType,
          onboarding_inputs: {
            ...userAnswers.onboarding_inputs,
            user_intent: selectedIntent,
          },
        };
        await saveUserAnswers(user.id, updatedAnswers);
        setUserAnswers(updatedAnswers);
      } catch (error) {
        console.error("Error saving user type:", error);
        toast.error("Failed to save your selection. Please try again.");
      }
    }
  };

  const handleBackToTypeSelection = () => {
    setStep('type_selection');
    setUserType(null);
  };

  const handleCareerPathSelect = async (selectedPath: CareerPath) => {
    // Move to completing immediately — prevents any fallthrough flash during async
    setStep('completing');

    if (user?.id) {
      try {
        const updatedAnswers = {
          ...userAnswers,
          user_type: userType,
          career_path: selectedPath,
        };
        await saveUserAnswers(user.id, updatedAnswers);
        setUserAnswers(updatedAnswers);

        const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
        await markOnboardingComplete(user.id, 'job_seeker');

        // Defer navigation — wait for context to confirm hasCompletedOnboarding=true
        pendingNavigation.current = { path: '/profile', state: { fromOnboarding: true } };
        if (refreshUserState) await refreshUserState();
      } catch (error) {
        console.error("Error saving career path:", error);
        toast.error("Failed to save your career path selection.");
        // Step back so the user can retry
        setStep('career_path');
      }
    }
  };

  const handleBusinessOnboardingComplete = async () => {
    setStep('completing');
    try {
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

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading || isNavigating) {
    return <LansaLoader duration={5000} />;
  }

  const renderStep = () => {
    switch (step) {
      case 'type_selection':
        return <UserTypeSelection onSelect={handleUserTypeSelect} />;

      case 'career_path':
        return <CareerPathSegmentation onSelect={handleCareerPathSelect} />;

      case 'mentor_flow':
        return (
          <MentorOnboarding
            onComplete={async () => {
              setStep('completing');
              if (refreshUserState) await refreshUserState();
              navigate('/mentor-dashboard', { replace: true });
            }}
          />
        );

      case 'create_org':
        return <OrganizationOnboardingForm onComplete={handleBusinessOnboardingComplete} />;

      case 'join_org':
        return (
          <JoinOrganizationFlow
            onComplete={handleBusinessOnboardingComplete}
            onBack={handleBackToTypeSelection}
          />
        );

      case 'completing':
        return <LansaLoader duration={5000} />;

      default:
        return null;
    }
  };

  const showLogo = step !== 'type_selection' && step !== 'career_path';

  return (
    <OnboardingErrorBoundary>
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
        {showLogo && (
          <header className="flex w-full px-4 md:px-6 py-4 items-center justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
              alt="Lansa Logo"
              className="aspect-[2.7] object-contain w-[92px]"
            />
          </header>
        )}

        <main className="flex-1">
          {renderStep()}
        </main>

        <footer className="text-center py-6 text-sm text-[#1A1F71]">
          © 2025 Lansa
        </footer>
      </div>
    </OnboardingErrorBoundary>
  );
}
