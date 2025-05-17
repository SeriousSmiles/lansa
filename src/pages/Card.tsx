import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers } from "@/services/question";
import { LoadingTransitionModal } from "@/components/loading/LoadingTransitionModal";
import { CompletionCard } from "@/components/card/CompletionCard";
import { CardPageLayout } from "@/components/layouts/CardPageLayout";
import { useOnboardingCompletion } from "@/hooks/useOnboardingCompletion";
import { getProfileRole } from "@/services/question";

export default function CardPage() {
  const { state } = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<string | undefined>(state?.identity);
  const [desiredOutcome, setDesiredOutcome] = useState<string | undefined>(state?.desiredOutcome);
  
  const { 
    isTransitioning, 
    isRefreshing,
    markOnboardingCompleted, 
    handleDashboardTransition 
  } = useOnboardingCompletion();

  // Mark onboarding as completed when this page loads
  useEffect(() => {
    async function initializeCardPage() {
      // Mark onboarding as completed
      await markOnboardingCompleted();
      
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
  }, [user, markOnboardingCompleted]);

  useEffect(() => {
    // Load user data if not provided via state
    async function loadUserData() {
      try {
        if (user?.id) {
          const answers = await getUserAnswers(user.id);
          if (answers) {
            setIdentity(answers.identity);
            setDesiredOutcome(answers.desired_outcome);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [user]);

  const handleGetStartedWithActions = () => {
    handleDashboardTransition(true); // true = highlight recommended actions
  };

  const handleGoToDashboard = () => {
    handleDashboardTransition(false); // false = don't highlight actions
  };

  return (
    <CardPageLayout isLoading={isLoading}>
      {/* Loading transition modal */}
      <LoadingTransitionModal 
        isOpen={isTransitioning} 
        isRefreshing={isRefreshing}
      />
      
      <CompletionCard
        onGetStarted={handleGetStartedWithActions}
        onGoToDashboard={handleGoToDashboard}
        isTransitioning={isTransitioning}
      />
    </CardPageLayout>
  );
}
