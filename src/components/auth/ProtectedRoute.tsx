
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user?.id) {
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
          
          const userAnswers = await getUserAnswers(user.id);
          console.log("User answers for onboarding check:", userAnswers);
          
          // Check if onboarding is complete using our helper function
          const isComplete = hasCompletedOnboarding(userAnswers);
          console.log("Has completed onboarding:", isComplete);
          
          setOnboardingStatus(isComplete);
          setInitialCheck(true);
        } catch (error) {
          console.error("Failed to check onboarding status:", error);
          setOnboardingStatus(false);
          setInitialCheck(true);
          toast.error("Failed to check onboarding status. Please try again.");
        }
        setLoading(false);
      } else {
        setInitialCheck(true);
        setLoading(false);
      }
    }

    if (user) {
      checkOnboardingStatus();
    } else {
      setInitialCheck(true);
      setLoading(false);
    }
  }, [user, updateDisplayName]);

  // If we're still on the first load, show a more substantial loading indicator
  if (!initialCheck) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[rgba(253,248,242,1)]">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
        <p className="text-xl">Loading your profile...</p>
      </div>
    );
  }

  // If there's no user, redirect to auth page instead of onboarding
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (loading && !initialCheck) {
    // Show loading while checking onboarding status
    return (
      <div className="flex items-center justify-center h-screen bg-[rgba(253,248,242,1)]">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  // Special handling for card page - this is the final step of onboarding
  // Allow access to card page regardless of onboarding status
  if (location.pathname === "/card") {
    console.log("On card page, allowing access regardless of onboarding status");
    return <Outlet />;
  }

  // If user is accessing the onboarding but has already completed onboarding,
  // redirect them to the dashboard
  if (location.pathname === "/onboarding" && onboardingStatus === true) {
    console.log("User has completed onboarding, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding, card, or result, redirect to onboarding
  if (onboardingStatus === false && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/card") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
