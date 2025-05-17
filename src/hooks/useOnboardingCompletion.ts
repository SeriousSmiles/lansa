
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, saveUserAnswers } from "@/services/question";
import { toast } from "sonner";

/**
 * Hook to handle onboarding completion and dashboard transition
 */
export const useOnboardingCompletion = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingMarked, setOnboardingMarked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Mark onboarding as completed for the current user
   */
  const markOnboardingCompleted = async () => {
    if (!user?.id || onboardingMarked) return false;

    try {
      // Load current user answers
      const userAnswers = await getUserAnswers(user.id);
      
      if (userAnswers) {
        // Add onboarding_completed flag
        const updatedAnswers = {
          ...userAnswers,
          onboarding_completed: true
        };
        
        // Save the updated answers
        await saveUserAnswers(user.id, updatedAnswers);
        console.log("Onboarding marked as completed");
        setOnboardingMarked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to mark onboarding as completed:", error);
      toast.error("Failed to update your profile. Please try again.");
      return false;
    }
  };

  /**
   * Handle transition to dashboard with optional highlighting of recommended actions
   */
  const handleDashboardTransition = async (highlightActions = false) => {
    if (isTransitioning) return;
    
    // Start transition and show loading modal
    setIsTransitioning(true);
    
    try {
      // Ensure onboarding is marked as completed
      if (!onboardingMarked && user?.id) {
        await markOnboardingCompleted();
      }
      
      // Store flag to highlight recommended actions if requested
      if (highlightActions) {
        localStorage.setItem('highlightRecommendedActions', 'true');
      }
      
      // Add artificial delay to show the loading states
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 10000); // Show loading for at least 10 seconds to display all statuses
      
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("An error occurred. Please try again.");
      setIsTransitioning(false);
    }
  };

  return {
    isTransitioning,
    onboardingMarked,
    markOnboardingCompleted,
    handleDashboardTransition
  };
};
