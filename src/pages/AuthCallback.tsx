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
        // Add a small delay to ensure OAuth session is fully established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Retry session retrieval up to 3 times with increasing delays
        let session = null;
        let sessionError = null;
        
        for (let i = 0; i < 3; i++) {
          const result = await supabase.auth.getSession();
          session = result.data.session;
          sessionError = result.error;
          
          if (session?.user || sessionError) break;
          
          // Wait before retry (100ms, 300ms, 500ms)
          await new Promise(resolve => setTimeout(resolve, 100 + (i * 200)));
        }
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error("Authentication failed. Please try again.");
          navigate('/auth', { replace: true });
          return;
        }

        if (!session?.user) {
          console.log("No session found after retries, redirecting to auth");
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

        // For new OAuth users, create both profile and answers atomically
        if (!userProfile || !userAnswers) {
          console.log("Creating new OAuth user records");
          
          const displayName = user.user_metadata?.full_name || 
                             `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                             user.email?.split('@')[0] || 
                             'Lansa User';

          // Use a transaction-like approach: create both records and verify success
          const profilePromise = !userProfile ? supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              name: displayName,
              email: user.email,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name
            }) : Promise.resolve({ error: null });

          const answersPromise = !userAnswers ? supabase
            .from('user_answers')
            .insert({
              user_id: user.id,
              user_type: 'job_seeker',
              career_path_onboarding_completed: false,
              // Set default values that mark OAuth users as partially onboarded
              identity: 'Job-seeker', // Default identity for OAuth users
              desired_outcome: 'Land my ideal role' // Default outcome
            }) : Promise.resolve({ error: null });

          const [profileResult, answersResult] = await Promise.all([
            profilePromise,
            answersPromise
          ]);

          if (profileResult.error) {
            console.error("Error creating user profile:", profileResult.error);
            toast.error("Failed to create user profile. Please try again.");
            navigate('/auth', { replace: true });
            return;
          }

          if (answersResult.error) {
            console.error("Error creating user answers:", answersResult.error);
            toast.error("Failed to create user data. Please try again.");
            navigate('/auth', { replace: true });
            return;
          }

          // Refetch user answers if we just created them
          if (!userAnswers) {
            const refetchedAnswers = await getUserAnswers(user.id);
            console.log("Refetched user answers:", refetchedAnswers);
          }
        }

        // For OAuth users, we'll always redirect to onboarding to complete their profile
        // This avoids the redirect loop and ensures proper onboarding completion
        console.log("OAuth user redirected to onboarding for profile completion");
        navigate('/onboarding', { replace: true });

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