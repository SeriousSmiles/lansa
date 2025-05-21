
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers } from "@/services/question";
import { getPersonalizedInsight, getBasicInsightFromAnswers } from "@/services/question/insightService";
import { LoadingTransitionModal } from "@/components/loading/LoadingTransitionModal";
import { CompletionCard } from "@/components/card/CompletionCard";
import { CardPageLayout } from "@/components/layouts/CardPageLayout";
import { useOnboardingCompletion } from "@/hooks/useOnboardingCompletion";
import { toast } from "sonner";

export default function CardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<string | undefined>(state?.identity);
  const [desiredOutcome, setDesiredOutcome] = useState<string | undefined>(state?.desiredOutcome);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);
  // Local state for transition management
  const [localIsTransitioning, setLocalIsTransitioning] = useState(false);
  
  const { 
    isTransitioning, 
    isRefreshing,
    markOnboardingCompleted, 
    handleDashboardTransition,
    navigateToDashboard
  } = useOnboardingCompletion();

  // Fetch data and mark onboarding as completed on page load
  useEffect(() => {
    async function initializeCardPage() {
      if (!user?.id) {
        toast.error("You need to be logged in to view this page.");
        navigate("/auth", { replace: true });
        return;
      }
      
      try {
        console.log('Initializing card page for user:', user.id);
        // Load user data
        const answers = await getUserAnswers(user.id);
        console.log('Loaded user answers:', answers);
        
        if (answers) {
          setIdentity(answers.identity || "Professional");
          setDesiredOutcome(answers.desired_outcome || "Professional clarity");
          
          // Check if we already have a stored AI insight
          if (answers.ai_insight) {
            console.log('Found stored AI insight:', answers.ai_insight);
            setAiInsight(answers.ai_insight);
            setIsLoadingInsight(false);
          } else {
            console.log('No stored AI insight found, generating new one');
            // Generate new AI insight
            try {
              const insight = await getPersonalizedInsight(user.id, answers);
              console.log('Generated new AI insight:', insight);
              setAiInsight(insight);
            } catch (error) {
              console.error('Failed to generate AI insight:', error);
              // Show error toast
              toast.error("Could not generate personalized insight. Using default message.");
              // If insight generation fails, use default text
              const fallbackInsight = getBasicInsightFromAnswers(answers);
              console.log('Using fallback insight:', fallbackInsight);
              setAiInsight(fallbackInsight);
            } finally {
              setIsLoadingInsight(false);
            }
          }
        } else {
          console.log('No user answers found');
          setIsLoadingInsight(false);
        }
        
        // Mark onboarding as completed
        await markOnboardingCompleted();
        
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load your profile information.");
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
      
      // Block navigation with browser's back button
      const handlePopState = (event: PopStateEvent) => {
        // Prevent going back
        event.preventDefault();
        window.history.pushState(null, "", window.location.pathname);
        return false;
      };

      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener('popstate', handlePopState);

      // Clean up event listener
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
    
    initializeCardPage();
  }, [user, markOnboardingCompleted, navigate]);

  // Modified to navigate directly to the Dashboard
  const handleGoToDashboard = () => {
    // Set a flag in localStorage to indicate we're coming from the card page
    localStorage.setItem('highlightRecommendedActions', 'true');
    
    // Use local state to show transition
    setLocalIsTransitioning(true);
    
    // Skip dashboard-ready page and go directly to dashboard after a brief delay
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1500);
  };

  return (
    <CardPageLayout isLoading={isLoading}>
      {/* Simplified loading transition modal */}
      <LoadingTransitionModal 
        isOpen={localIsTransitioning} 
        isRefreshing={isRefreshing}
        onComplete={navigateToDashboard}
      />
      
      <CompletionCard
        onGoToDashboard={handleGoToDashboard}
        isTransitioning={localIsTransitioning}
        identity={identity}
        desiredOutcome={desiredOutcome}
        aiInsight={aiInsight}
        isLoadingInsight={isLoadingInsight}
      />
    </CardPageLayout>
  );
}
