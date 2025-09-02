import { 
  useState, useEffect 
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, saveUserAnswers } from "@/services/question";
import { LoadingTransitionModal } from "@/components/loading/LoadingTransitionModal";
import { CompletionCard } from "@/components/card/CompletionCard";
import { CardPageLayout } from "@/components/layouts/CardPageLayout";
import { useOnboardingCompletion } from "@/hooks/useOnboardingCompletion";
import { useActionTracking } from "@/hooks/useActionTracking";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function CardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<string | undefined>(state?.identity);
  const [desiredOutcome, setDesiredOutcome] = useState<string | undefined>(state?.desiredOutcome);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [aiCard, setAiCard] = useState<any>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);
  // Local state for transition management
  const [localIsTransitioning, setLocalIsTransitioning] = useState(false);
  
  const { 
    markOnboardingCompleted
  } = useOnboardingCompletion();
  
  const { track } = useActionTracking();

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
          
          // Generate or fetch the AI onboarding card
          const existingCard = (answers as any).ai_onboarding_card;
          if (existingCard) {
            console.log('Found stored onboarding card');
            setAiCard(existingCard);
            setIsLoadingInsight(false);
          } else {
            try {
              const payload = {
                answers: {
                  ...(answers.onboarding_inputs || {}),
                  identity: answers.identity,
                  desired_outcome: answers.desired_outcome,
                },
              };
              const { data, error } = await supabase.functions.invoke('generate-onboarding-card', {
                body: payload,
              });
              if (error) throw error;
              const card = (data as any)?.card;
              setAiCard(card);
              // Persist card for later use
              await saveUserAnswers(user.id, { ai_onboarding_card: card } as any);
            } catch (err) {
              console.error('Failed to generate onboarding card:', err);
              toast.error('Could not generate your personalized card.');
              setAiInsight('We could not auto-generate your plan right now. Your dashboard will guide you through the next steps.');
            } finally {
              setIsLoadingInsight(false);
            }
          }
        } else {
          console.log('No user answers found');
          setIsLoadingInsight(false);
        }
        
        // Mark onboarding as completed and track the action
        await markOnboardingCompleted();
        await track('onboarding_completed', { identity, desiredOutcome });
        
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
  }, [user, markOnboardingCompleted, navigate, track, identity, desiredOutcome]);

  // Handle navigation to dashboard - simplified for mobile
  const handleGoToDashboard = () => {
    console.log('Navigating to dashboard from card page');
    // Set a flag in localStorage to indicate we're coming from the card page
    localStorage.setItem('highlightRecommendedActions', 'true');
    
    // Use local state to show transition
    setLocalIsTransitioning(true);
    
    // Navigate directly to dashboard after a brief delay
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000); // Reduced delay for better mobile experience
  };

  return (
    <CardPageLayout isLoading={isLoading}>
      {/* Simplified loading transition modal */}
      <LoadingTransitionModal 
        isOpen={localIsTransitioning} 
        isRefreshing={false}
        onComplete={() => navigate('/dashboard', { replace: true })}
      />
      
      <CompletionCard
        onGoToDashboard={handleGoToDashboard}
        isTransitioning={localIsTransitioning}
        identity={identity}
        desiredOutcome={desiredOutcome}
        aiInsight={aiInsight}
        aiCard={aiCard}
        isLoadingInsight={isLoadingInsight}
      />
    </CardPageLayout>
  );
}
