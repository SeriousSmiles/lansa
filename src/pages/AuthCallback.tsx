import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthProvider";
import { SEOHead } from "@/components/SEOHead";
import { scrubTokensFromUrl } from "@/config/demo";
import { getPostAuthDestination } from "@/utils/roleRoutes";

export default function AuthCallback() {
  const {
    session,
    loading,
    user,
    isAuthenticated,
    userType,
    hasCompletedOnboarding,
    isAdmin,
    refreshUserState,
  } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const redirectAttempts = useRef(0);
  const hasProcessedRef = useRef(false);

  // Delayed token scrubbing to allow Supabase processing
  useEffect(() => {
    const timer = setTimeout(() => {
      scrubTokensFromUrl();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Simplified auth callback using UserStateProvider
  useEffect(() => {
    if (hasProcessedRef.current) return;

    const processAuthentication = async () => {
      try {
        // Wait for UnifiedAuthProvider to load auth + role data
        if (loading) return;

        // If authenticated, route through the same role-aware resolver used
        // across the app. This also respects a safe `next` value when a guarded
        // route sent the user to Google OAuth.
        if (session?.user && isAuthenticated) {
          hasProcessedRef.current = true;
          setIsProcessing(true);
          await refreshUserState();
          const nextPath = new URLSearchParams(window.location.search).get('next');
          const destination = getPostAuthDestination({
            requestedPath: nextPath,
            userType,
            hasCompletedOnboarding,
            isAdmin,
          });
          navigate(destination, { replace: true, state: { fromRedirect: true } });
          setIsProcessing(false);
          return;
        }

        // If no session after auth should have completed, redirect back
        if (!loading && !session) {
          redirectAttempts.current++;
          
          // Prevent infinite redirects
          if (redirectAttempts.current > 3) {
            setError('Authentication failed. Please try again.');
            setIsProcessing(false);
            setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 2000);
            return;
          }

          // Give more time for session establishment
          if (redirectAttempts.current <= 2) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }

          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Authentication processing error:', error);
        setError('Authentication error occurred.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
      }
    };

    // Set timeout fallback
    timeoutRef.current = setTimeout(() => {
      if (!hasProcessedRef.current) {
        console.warn('Auth callback timeout - redirecting to auth');
        navigate('/auth', { replace: true });
      }
    }, 10000);

    processAuthentication();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, session, navigate, user, isAuthenticated, userType, hasCompletedOnboarding, isAdmin, refreshUserState]);

  return (
    <>
      <SEOHead
        title="Signing you in... | Lansa"
        description="Processing your authentication..."
        canonical="https://lansa.online/auth/callback"
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          {error ? (
            <div>
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-muted-foreground text-sm">Redirecting...</p>
            </div>
          ) : isProcessing ? (
            <p className="text-muted-foreground">Processing authentication...</p>
          ) : (
            <p className="text-muted-foreground">Signing you in...</p>
          )}
        </div>
      </div>
    </>
  );
}