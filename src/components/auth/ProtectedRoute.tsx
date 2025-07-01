
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log('No user in ProtectedRoute, finishing loading');
      setLoading(false);
      return;
    }
    
    console.log('ProtectedRoute: Checking user profile for user:', user.id);
    checkUserProfile();
    
    async function checkUserProfile() {
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
          
          // Check if user has completed onboarding
          const userAnswers = await getUserAnswers(user.id);
          console.log("User answers in ProtectedRoute:", userAnswers);
          
          const completed = hasCompletedOnboarding(userAnswers);
          console.log("Onboarding completed:", completed);
          
          setOnboardingCompleted(completed);
          
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
      setLoading(false);
    }
  }, [user, updateDisplayName]);

  // Show loading while checking user status
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[rgba(253,248,242,1)]">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
        <p className="text-xl">Loading your profile...</p>
      </div>
    );
  }

  // If there's no user, redirect to auth page
  if (!user) {
    console.log('No user in ProtectedRoute, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Special handling for card page - allow access regardless of onboarding status
  if (location.pathname === "/card") {
    console.log("On card page, allowing access");
    return <Outlet />;
  }

  // Check if the user is accessing the dashboard page
  if (location.pathname === "/dashboard" && !onboardingCompleted) {
    console.log("User hasn't completed onboarding, redirecting to onboarding");
    toast.info("Please complete onboarding before accessing the dashboard");
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Allowing access to', location.pathname);
  return <Outlet />;
}
