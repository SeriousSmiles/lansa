import { Navigate, useLocation } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: JSX.Element;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  allowedUserTypes?: Array<'job_seeker' | 'employer'>;
  requireAdmin?: boolean;
}

/**
 * Unified Route Guard Component
 * 
 * Handles all authentication and authorization logic in one place:
 * 1. Authentication check (session)
 * 2. Admin role verification
 * 3. Onboarding completion check
 * 4. User type restrictions
 * 
 * Precedence: admin > auth > onboarding > userType
 */
export function RouteGuard({ 
  children, 
  requireAuth = true,
  requireOnboarding = false,
  allowedUserTypes,
  requireAdmin = false
}: RouteGuardProps) {
  const { session, loading: authLoading } = useAuth();
  const { userType, loading: stateLoading, hasCompletedOnboarding, isRefreshing } = useUserState();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Check admin role
  useEffect(() => {
    async function checkAdminRole() {
      if (!requireAdmin && !session?.user?.id) {
        setIsAdmin(false);
        setAdminCheckComplete(true);
        return;
      }

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
  }, [session?.user?.id, requireAdmin]);

  // Show loading only for initial load, not background refreshes
  const shouldShowLoading = (authLoading || stateLoading || (requireAdmin && !adminCheckComplete)) && !session && !isRefreshing;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 1. Authentication check
  if (requireAuth && !session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Admin check (highest priority)
  if (requireAdmin) {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return <Navigate to="/" replace />;
    }
    return children; // Admin verified, allow access
  }

  // 3. Onboarding check (but skip for admins)
  if (requireOnboarding && !hasCompletedOnboarding && !isAdmin) {
    // Allow access to onboarding page itself
    if (location.pathname === '/onboarding') {
      return children;
    }
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // 4. User type check (but skip for admins)
  if (allowedUserTypes && !isAdmin) {
    if (!userType || !allowedUserTypes.includes(userType)) {
      toast.error(`This area is for ${allowedUserTypes.join(' or ')} users only.`, {
        description: userType ? `You're currently set as: ${userType}` : 'No user type set',
      });
      return (
        <Navigate 
          to="/not-allowed" 
          state={{ 
            from: location, 
            required: allowedUserTypes, 
            current: userType || 'unknown' 
          }} 
          replace 
        />
      );
    }
  }

  return children;
}
