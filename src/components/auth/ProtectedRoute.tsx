
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { getProfileStatus } from "@/services/profileStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    let didCancel = false;
    const timeoutId = setTimeout(() => {
      // Failsafe: if something hangs > 6s, allow navigation and let routes handle finer checks
      if (!didCancel) {
        setLoading(false);
        setInitialCheck(true);
      }
    }, 6000);

    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      if (!user) {
        setLoading(false);
        setInitialCheck(true);
        return;
      }
      checkUserProfile();
    }, 150);

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

          // Check onboarding and profile status
          const userAnswers = await getUserAnswers(user.id);
          const completed = hasCompletedOnboarding(userAnswers);
          setOnboardingCompleted(completed);

          // Check if profile is ready for dashboard access
          const profileStatus = await getProfileStatus(user.id);
          setProfileReady(profileStatus.isProfileReady);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          if (!didCancel) {
            setLoading(false);
            setInitialCheck(true);
          }
        }
      } else {
        if (!didCancel) {
          setLoading(false);
          setInitialCheck(true);
        }
      }
    }

    return () => {
      didCancel = true;
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, [user, updateDisplayName, location.pathname]);

  // If we're still on the first load, show a loading indicator, but auto-advance after failsafe
  if (!initialCheck && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[rgba(253,248,242,1)]">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
        <p className="text-xl">Loading your profile...</p>
      </div>
    );
  }

  // If there's no user, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Special handling for card page - allow access regardless of onboarding status
  if (location.pathname === "/card") {
    console.log("On card page, allowing access regardless of onboarding status");
    return <Outlet />;
  }

  // Check if the user is accessing the dashboard page
  if (location.pathname === "/dashboard") {
    if (!onboardingCompleted) {
      // Let user into onboarding; prevent dead-end loops
      toast.info("Please complete onboarding first");
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
    // If onboarding complete but profile check failed to resolve, still allow access
    if (profileReady === false) {
      // Soft gate: nudge to profile but do not block access indefinitely
      toast.info("Complete your profile to unlock more features.");
    }
  }

  // If we get here, the user is authenticated, so allow access to the requested route
  return <Outlet />;
}
