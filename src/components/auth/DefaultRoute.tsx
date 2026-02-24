import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { useEffect } from 'react';
import Index from '@/pages/Index';

export function DefaultRoute() {
  const { loading, isAuthenticated, userType, hasCompletedOnboarding, isRefreshing } = useUnifiedAuth();
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
    } else if (userType === 'mentor') {
      navigate('/mentor-dashboard', { replace: true, state: { fromRedirect: true } });
    } else if (userType === 'job_seeker') {
      navigate('/dashboard', { replace: true, state: { fromRedirect: true } });
    }
  }, [loading, isAuthenticated, userType, hasCompletedOnboarding, navigate]);

  // CRITICAL: Show loader while auth resolves — prevents landing page flash
  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <Index />;
  }

  // Authenticated but waiting for redirect effect — show loader, not landing page
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  );
}
