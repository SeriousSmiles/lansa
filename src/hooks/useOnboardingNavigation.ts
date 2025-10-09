/**
 * Custom hook for onboarding navigation
 * Wraps navigation service with React hooks
 */

import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { 
  getPostOnboardingDestination, 
  getDestinationLabel,
  UserType,
  CareerPath 
} from '@/services/navigation/onboardingNavigationService';
import { useUserState } from '@/contexts/UserStateProvider';

export function useOnboardingNavigation() {
  const navigate = useNavigate();
  const { refreshUserState } = useUserState();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateAfterOnboarding = useCallback(
    async (userType: UserType, careerPath?: CareerPath) => {
      setIsNavigating(true);
      
      try {
        // Refresh user state before navigation and wait for it to complete
        if (refreshUserState) {
          await refreshUserState();
        }
        
        const destination = getPostOnboardingDestination(userType, careerPath);
        const label = getDestinationLabel(userType);
        
        console.log(`Navigating to ${label} (${destination})`);
        navigate(destination, { replace: true });
      } catch (error) {
        console.error('Error during post-onboarding navigation:', error);
        // Fallback navigation
        navigate('/dashboard', { replace: true });
      } finally {
        setIsNavigating(false);
      }
    },
    [navigate, refreshUserState]
  );

  return {
    navigateAfterOnboarding,
    isNavigating,
    getDestinationLabel
  };
}
