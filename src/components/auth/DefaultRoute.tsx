import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { useEffect } from 'react';
import Index from '@/pages/Index';
import { getRoleHomePath } from '@/utils/roleRoutes';

export function DefaultRoute() {
  const { loading, isAuthenticated, userType, hasCompletedOnboarding, isRefreshing, isAdmin } = useUnifiedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    if (isAdmin) {
      navigate('/admin', { replace: true, state: { fromRedirect: true } });
      return;
    }

    if (!hasCompletedOnboarding) {
      navigate('/onboarding', { replace: true, state: { fromRedirect: true } });
      return;
    }

    navigate(getRoleHomePath({ userType }), { replace: true, state: { fromRedirect: true } });
  }, [loading, isAuthenticated, userType, hasCompletedOnboarding, isAdmin, navigate]);

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
