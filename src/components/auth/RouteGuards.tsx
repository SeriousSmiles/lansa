import { Navigate, useLocation } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated, isRefreshing } = useUserState();
  const location = useLocation();
  
  // Only show loading if we don't know auth status yet (not for background refreshes)
  if (loading && !isAuthenticated && !isRefreshing) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

export function RequireOnboarding({ 
  children, 
  soft = false  // CHANGED: Default to false (hard gate) for security
}: { 
  children: JSX.Element; 
  soft?: boolean;  // DEPRECATED: Soft gates should only be used for premium features, not onboarding
}) {
  const { loading, hasCompletedOnboarding, userType, isAuthenticated, isRefreshing } = useUserState();
  const location = useLocation();
  
  // Only show loading if we don't know auth status yet (not for background refreshes)
  if (loading && !isAuthenticated && !isRefreshing) return <LoadingScreen />;

  // If user has completed onboarding, allow access
  if (hasCompletedOnboarding) return children;

  // If user is ON the onboarding page and hasn't completed, allow them to see it
  if (location.pathname === '/onboarding') return children;

  // CRITICAL: If user has no user_type, they MUST complete onboarding regardless of soft gate
  // This prevents users from bypassing onboarding
  if (!userType) {
    console.warn("⚠️ Blocking access - user has no user_type");
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // NEW: For employers, allow access if onboarding completed (even without active org)
  // They can see the pending dashboard with their request status
  if (userType === 'employer' && hasCompletedOnboarding) {
    return children;
  }

  // Soft gate: show teaser with banner (DEPRECATED - only for premium features)
  if (soft) {
    console.warn("⚠️ DEPRECATED: Soft onboarding gate used. This should only be used for premium features, not core onboarding.");
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">Complete your onboarding to unlock full access</p>
                <p className="text-sm text-muted-foreground">You're viewing a preview. Finish setup to interact with everything.</p>
              </div>
              <Button asChild>
                <a href="/onboarding">Continue Onboarding</a>
              </Button>
            </div>
          </div>
        </div>
        <div className="opacity-75 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // Hard gate: redirect to onboarding
  return <Navigate to="/onboarding" state={{ from: location }} replace />;
}

export function RequireUserType({ 
  children, 
  allowedTypes,
  silent = false
}: { 
  children: JSX.Element; 
  allowedTypes: Array<'job_seeker' | 'employer'>;
  silent?: boolean;
}) {
  const { loading, userType, careerPath, isAuthenticated, isRefreshing } = useUserState();
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!userType) return;

    const isAllowed = allowedTypes.includes(userType);
    const isRedirect = Boolean(location.state && (location.state as any).fromRedirect);

    // Show toast only if:
    //  - not silent
    //  - not already shown
    //  - user is NOT allowed
    //  - this navigation was deliberate (i.e., not an auto-redirect)
    if (!silent && !hasShownToast.current && !isAllowed && !isRedirect) {
      toast.error(`This area is for ${allowedTypes.join(' or ')} users only.`, {
        description: `You're currently set as: ${userType}`,
      });
      hasShownToast.current = true;
    }
  }, [loading, userType, allowedTypes, silent, location.state]);
  
  // Only show loading if we don't know auth status yet (not for background refreshes)
  if (loading && !isAuthenticated && !isRefreshing) return <LoadingScreen />;

  if (!userType || !allowedTypes.includes(userType)) {
    return (
      <Navigate 
        to="/not-allowed" 
        state={{ 
          from: location, 
          required: allowedTypes, 
          current: userType || 'unknown',
          careerPath 
        }} 
        replace 
      />
    );
  }

  return children;
}
