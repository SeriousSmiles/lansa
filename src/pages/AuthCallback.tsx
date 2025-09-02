import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error("Authentication failed. Please try again.");
          navigate('/auth', { replace: true });
          return;
        }

        if (!session?.user) {
          console.log("No session found, redirecting to auth");
          navigate('/auth', { replace: true });
          return;
        }

        const user = session.user;
        console.log("Processing OAuth callback for user:", user.id);

        // Check if user has existing data (returning user vs new user)
        const [userAnswers, { data: userProfile }] = await Promise.all([
          getUserAnswers(user.id),
          supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        // Create profile if it doesn't exist (new Google OAuth user)
        if (!userProfile) {
          const displayName = user.user_metadata?.full_name || 
                             `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                             user.email?.split('@')[0] || 
                             'Lansa User';

          console.log("Creating new profile for OAuth user:", displayName);
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              name: displayName,
              email: user.email,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name
            });

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            // Don't block the flow if profile creation fails
          }
        }

        // Create user_answers record if it doesn't exist
        if (!userAnswers) {
          console.log("Creating user_answers record for new OAuth user");
          
          const { error: answersError } = await supabase
            .from('user_answers')
            .insert({
              user_id: user.id,
              user_type: 'job_seeker', // Default for OAuth users
              career_path_onboarding_completed: false
            });

          if (answersError) {
            console.error("Error creating user answers:", answersError);
            // Don't block the flow if answers creation fails
          }
        }

        // Determine where to route the user
        const onboardingCompleted = hasCompletedOnboarding(userAnswers);
        
        if (onboardingCompleted) {
          console.log("User has completed onboarding, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("User needs onboarding, redirecting to onboarding");
          navigate('/onboarding', { replace: true });
        }

      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        toast.error("Authentication failed. Please try again.");
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}