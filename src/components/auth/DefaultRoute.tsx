import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateProvider';
import Index from '@/pages/Index';

export function DefaultRoute() {
  const { loading, isAuthenticated, userType, hasCompletedOnboarding } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    // Redirect to onboarding if not completed
    if (!hasCompletedOnboarding) {
      console.info("🔄 [DefaultRoute] Redirecting to onboarding - not completed", {
        userType,
        hasCompletedOnboarding,
        loading
      });
      navigate('/onboarding', { replace: true, state: { fromRedirect: true } });
      return;
    }

    // Redirect to appropriate dashboard based on user type
    if (userType === 'employer') {
      console.info("🔄 [DefaultRoute] Redirecting to employer dashboard", { userType });
      navigate('/employer-dashboard', { replace: true, state: { fromRedirect: true } });
      return;
    }

    if (userType === 'mentor') {
      console.info("🔄 [DefaultRoute] Redirecting to mentor dashboard", { userType });
      navigate('/mentor-dashboard', { replace: true, state: { fromRedirect: true } });
      return;
    }

    if (userType === 'job_seeker') {
      console.info("🔄 [DefaultRoute] Redirecting to job seeker dashboard", { userType });
      navigate('/dashboard', { replace: true, state: { fromRedirect: true } });
      return;
    }

    // Fallback for unknown user types
    console.warn("⚠️ [DefaultRoute] Unknown user type, staying on landing page", { userType });
  }, [loading, isAuthenticated, userType, hasCompletedOnboarding, navigate]);

  return <Index />;
}
