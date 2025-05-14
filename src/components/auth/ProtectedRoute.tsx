
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/QuestionService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user?.id) {
        console.log("Checking onboarding status for user:", user.id);
        try {
          // Fetch user profile to ensure display name is set
          if (!user.displayName || user.displayName === user.email?.split('@')[0]) {
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('name')
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (profileData?.name && typeof updateDisplayName === 'function') {
              updateDisplayName(profileData.name);
            }
          }
          
          // Get answers once and cache them to avoid multiple API calls
          const userAnswers = await getUserAnswers(user.id);
          console.log("User answers for onboarding check:", userAnswers);
          
          // Check if onboarding is complete using our helper function
          const isComplete = hasCompletedOnboarding(userAnswers);
          console.log("Has completed onboarding:", isComplete);
          
          // Update state once with final value
          setOnboardingStatus(isComplete);
          setLoading(false);
        } catch (error) {
          console.error("Failed to check onboarding status:", error);
          setOnboardingStatus(false);
          setLoading(false);
          toast.error("Failed to check onboarding status. Please try again.");
        }
      } else {
        setLoading(false);
      }
    }

    // Only make the API call once per mount or when user changes
    if (user && checkCount === 0) {
      checkOnboardingStatus();
      setCheckCount(1); // Prevent repeated checks
    } else if (!user) {
      setLoading(false);
    }
  }, [user, updateDisplayName]);

  // If user is not authenticated, redirect to auth page
  if (!user) {
    console.log("User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (loading) {
    // Show loading while checking onboarding status
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  // Safety check to prevent infinite loops - if we still don't know after trying, 
  // assume not completed and send to onboarding
  if (onboardingStatus === null) {
    console.log("Onboarding status null, sending to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If user is accessing the onboarding or card page but has already completed onboarding,
  // redirect them to the dashboard
  if ((location.pathname === "/onboarding" || location.pathname === "/card") && onboardingStatus === true) {
    console.log("User has completed onboarding, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding or card or result, redirect to onboarding
  if (onboardingStatus === false && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/result" &&
      location.pathname !== "/card") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If we made it here, render the requested page
  return <Outlet />;
}
