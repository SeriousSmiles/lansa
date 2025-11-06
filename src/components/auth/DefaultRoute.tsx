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

    if (!hasCompletedOnboarding) {
      navigate('/onboarding', { replace: true, state: { fromRedirect: true } });
      return;
    }

    if (userType === 'employer') {
      navigate('/employer-dashboard', { replace: true, state: { fromRedirect: true } });
      return;
    }

    if (userType === 'job_seeker') {
      navigate('/dashboard', { replace: true, state: { fromRedirect: true } });
      return;
    }
  }, [loading, isAuthenticated, userType, hasCompletedOnboarding, navigate]);

  return <Index />;
}
