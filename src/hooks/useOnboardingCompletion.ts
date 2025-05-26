
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, saveUserAnswers } from "@/services/question";

/**
 * Hook to handle onboarding completion and dashboard transition
 */
export const useOnboardingCompletion = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [onboardingMarked, setOnboardingMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Mark onboarding as completed for the current user
   */
  const markOnboardingCompleted = async () => {
    if (!user?.id || onboardingMarked) return false;

    try {
      setError(null);
      // Load current user answers
      const userAnswers = await getUserAnswers(user.id);
      
      if (userAnswers) {
        // Add onboarding_completed flag
        const updatedAnswers = {
          ...userAnswers,
          onboarding_completed: true
        };
        
        // Save the updated answers
        const result = await saveUserAnswers(user.id, updatedAnswers);
        
        if (result.success) {
          console.log("Onboarding marked as completed");
          setOnboardingMarked(true);
          return true;
        } else {
          setError("Failed to update your profile. Please try again.");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to mark onboarding as completed:", error);
      setError("Failed to update your profile. Please try again.");
      return false;
    }
  };

  /**
   * Process the navigation to dashboard after loading animation completes
   */
  const navigateToDashboard = () => {
    setIsTransitioning(false);
    // Set the flag to highlight recommended actions on the dashboard
    localStorage.setItem('highlightRecommendedActions', 'true');
    navigate('/dashboard', { replace: true });
  };

  /**
   * Handle transition to dashboard
   */
  const handleDashboardTransition = async () => {
    if (isTransitioning) return;
    
    // Start transition and show loading modal
    setIsTransitioning(true);
    setError(null);
    
    try {
      // Ensure onboarding is marked as completed
      if (!onboardingMarked && user?.id) {
        const success = await markOnboardingCompleted();
        if (!success) {
          setIsTransitioning(false);
          return;
        }
      }
      
      // Directly navigate to dashboard after a brief delay
      setTimeout(() => {
        navigateToDashboard();
      }, 1500);
      
    } catch (error) {
      console.error("Navigation error:", error);
      setError("An error occurred. Please try again.");
      setIsTransitioning(false);
    }
  };

  return {
    isTransitioning,
    isRefreshing,
    onboardingMarked,
    error,
    markOnboardingCompleted,
    handleDashboardTransition,
    navigateToDashboard,
    setIsTransitioning
  };
};
