import { Navigate, useLocation } from "react-router-dom";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthProvider";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface GuardProps {
  children: JSX.Element;
  /** Require authentication (default: true) */
  auth?: boolean;
  /** Require completed onboarding */
  onboarding?: boolean;
  /** Restrict to specific user types */
  types?: Array<'job_seeker' | 'employer' | 'mentor'>;
  /** Require admin role */
  admin?: boolean;
  /** Suppress the "not allowed" toast */
  silent?: boolean;
}

/**
 * Unified route guard. Evaluates auth → admin → onboarding → userType in one pass.
 * Never renders children until the decision is made (no flash).
 */
export function Guard({
  children,
  auth = true,
  onboarding = false,
  types,
  admin = false,
  silent = false,
}: GuardProps) {
  const {
    session,
    loading,
    isRefreshing,
    isAdmin,
    userType,
    careerPath,
    hasCompletedOnboarding,
  } = useUnifiedAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Show "not allowed" toast once
  useEffect(() => {
    if (loading || isRefreshing) return;
    if (silent || hasShownToast.current) return;
    if (!types || !userType) return;
    if (types.includes(userType)) return;

    const isRedirect = Boolean(location.state && (location.state as any).fromRedirect);
    if (isRedirect) return;

    toast.error(`This area is for ${types.join(' or ')} users only.`, {
      description: `You're currently set as: ${userType}`,
    });
    hasShownToast.current = true;
  }, [loading, isRefreshing, types, userType, silent, location.state]);

  // ─── Loading gate ───────────────────────────────────────────────
  // Only block on initial load, not background refreshes
  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // ─── 1. Auth check ──────────────────────────────────────────────
  if (auth && !session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // ─── 2. Admin check ─────────────────────────────────────────────
  if (admin) {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children; // Admin bypass — skip onboarding/type checks
  }

  // Admins bypass onboarding and type restrictions
  if (isAdmin) return children;

  // ─── 3. Onboarding check ────────────────────────────────────────
  if (onboarding && !hasCompletedOnboarding) {
    // Allow the onboarding page itself
    if (location.pathname === '/onboarding' || location.pathname === '/profile-starter') {
      return children;
    }
    // No userType means they haven't even started onboarding
    if (!userType) {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // ─── 4. User type check ─────────────────────────────────────────
  if (types) {
    // If auth is loaded but there's no userType, redirect to onboarding
    if (!userType) {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
    if (!types.includes(userType)) {
      return (
        <Navigate
          to="/not-allowed"
          state={{
            from: location,
            required: types,
            current: userType,
            careerPath,
          }}
          replace
        />
      );
    }
  }

  return children;
}
