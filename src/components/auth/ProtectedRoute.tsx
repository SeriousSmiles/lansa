import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserState } from '@/contexts/UserStateProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ProtectedRoute() {
  const { session, loading: authLoading } = useAuth();
  const { userType, loading: stateLoading, isRefreshing } = useUserState();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdminRole() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        setAdminCheckComplete(true);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setAdminCheckComplete(true);
      }
    }

    checkAdminRole();
  }, [session?.user?.id]);

  // CRITICAL: Only show loading screen if we don't know auth status yet
  // Don't block for background refreshes (isRefreshing)
  const shouldShowLoading = (authLoading || stateLoading || !adminCheckComplete) && !session && !isRefreshing;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL: Check if user is trying to access admin area
  const isAccessingAdmin = location.pathname.startsWith('/admin');
  
  // Allow admins to access admin area without user_type check
  if (isAdmin && isAccessingAdmin) {
    return <Outlet />;
  }

  // CRITICAL: If user is authenticated but has no user_type set, force them to onboarding
  // This prevents bypassing onboarding by manually navigating to other pages
  const isOnOnboardingPage = location.pathname === '/onboarding';
  const isOnProfileStarterPage = location.pathname === '/profile-starter';
  const allowedWithoutType = isOnOnboardingPage || isOnProfileStarterPage;
  
  // Don't redirect admins to onboarding
  if (!userType && !allowedWithoutType && !isAdmin) {
    console.warn("⚠️ User authenticated but missing user_type - redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}