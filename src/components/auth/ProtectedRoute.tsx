import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserState } from '@/contexts/UserStateProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

export default function ProtectedRoute() {
  const { session, loading: authLoading } = useAuth();
  const { userType, loading: stateLoading, isRefreshing } = useUserState();
  const location = useLocation();

  const loading = authLoading || stateLoading || isRefreshing;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL: If user is authenticated but has no user_type set, force them to onboarding
  // This prevents bypassing onboarding by manually navigating to other pages
  const isOnOnboardingPage = location.pathname === '/onboarding';
  const isOnProfileStarterPage = location.pathname === '/profile-starter';
  const allowedWithoutType = isOnOnboardingPage || isOnProfileStarterPage;
  
  if (!userType && !allowedWithoutType) {
    console.warn("⚠️ User authenticated but missing user_type - redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}