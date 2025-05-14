
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/QuestionService";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkOnboardingStatus() {
      if (!user?.id) {
        if (mounted) setLoading(false);
        return;
      }
      
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
        
        // Get answers to check onboarding status
        const userAnswers = await getUserAnswers(user.id);
        
        // Check if onboarding is complete using our helper function
        const isComplete = hasCompletedOnboarding(userAnswers);
        
        if (mounted) {
          setOnboardingStatus(isComplete);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // Default to false on error to ensure user goes through onboarding
        if (mounted) {
          setOnboardingStatus(false);
          setLoading(false);
        }
      }
    }

    checkOnboardingStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, updateDisplayName]);

  // Show loading state while checking authentication/onboarding
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For safety, if we still don't know onboarding status after loading,
  // assume not completed and redirect to onboarding
  if (onboardingStatus === null) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is accessing onboarding or card page but has already completed onboarding,
  // redirect to dashboard
  if ((location.pathname === "/onboarding" || location.pathname === "/card") && 
      onboardingStatus === true) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding or card or result, redirect to onboarding
  if (onboardingStatus === false && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/result" &&
      location.pathname !== "/card") {
    return <Navigate to="/onboarding" replace />;
  }

  // If we made it here, user is authenticated and allowed to access the route
  return <Outlet />;
}
