import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { scrubTokensFromUrl } from "@/config/demo";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const { session, loading, user } = useAuth();
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

  // Robust session handling with timeout and onboarding checks
  useEffect(() => {
    if (hasProcessedRef.current) return;

    const processAuthentication = async () => {
      try {
        // Wait for auth state to stabilize
        if (loading) return;

        // If we have a session, check onboarding status
        if (session?.user) {
          hasProcessedRef.current = true;
          setIsProcessing(true);

          try {
            const userAnswers = await getUserAnswers(session.user.id);
            const onboardingCompleted = hasCompletedOnboarding(userAnswers);

            if (onboardingCompleted) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // Fallback to dashboard if we can't check onboarding
            navigate('/dashboard', { replace: true });
          }
          
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
  }, [loading, session, navigate, user]);

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