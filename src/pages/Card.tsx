
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers } from "@/services/question";
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
        // Load user data
        const answers = await getUserAnswers(user.id);
        if (answers) {
          setIdentity(answers.identity || "Professional");
          setDesiredOutcome(answers.desired_outcome || "Professional clarity");
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

  // Modified to navigate to the DashboardReady page instead of directly to Dashboard
  const handleGoToDashboard = () => {
    handleDashboardTransition();
  };

  // Modified to redirect to the DashboardReady page
  const navigateToDashboardReady = () => {
    navigate('/dashboard-ready', { replace: true });
  };

  return (
    <CardPageLayout isLoading={isLoading}>
      {/* Loading transition modal with onComplete callback */}
      <LoadingTransitionModal 
        isOpen={isTransitioning} 
        isRefreshing={isRefreshing}
        onComplete={navigateToDashboardReady}
      />
      
      <CompletionCard
        onGoToDashboard={handleGoToDashboard}
        isTransitioning={isTransitioning}
        identity={identity}
        desiredOutcome={desiredOutcome}
      />
    </CardPageLayout>
  );
}
