import { Navigate, useLocation } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateProvider";
import { FLAGS } from "@/config/flags";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

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
  const { loading, isAuthenticated } = useUserState();
  const location = useLocation();

  if (!FLAGS.routeGuardsV2) return children;
  if (loading) return <LoadingScreen />;
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
  const { loading, hasCompletedOnboarding, userType } = useUserState();
  const location = useLocation();

  if (!FLAGS.routeGuardsV2) return children;
  if (loading) return <LoadingScreen />;

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

  // Soft gate: show teaser with banner (DEPRECATED - only for premium features)
  if (soft && FLAGS.softGateOnboarding) {
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
  allowedTypes 
}: { 
  children: JSX.Element; 
  allowedTypes: Array<'job_seeker' | 'employer'>;
}) {
  const { loading, userType, careerPath } = useUserState();
  const location = useLocation();

  useEffect(() => {
    if (!loading && userType && !allowedTypes.includes(userType)) {
      toast.error(`This area is for ${allowedTypes.join(' or ')} users only.`, {
        description: `You're currently set as: ${userType}`,
      });
    }
  }, [loading, userType, allowedTypes]);

  if (!FLAGS.routeGuardsV2) return children;
  if (loading) return <LoadingScreen />;

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
