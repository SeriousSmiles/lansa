
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { getProfileStatus } from "@/services/profileStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [hasShownProfileNotification, setHasShownProfileNotification] = useState(false);

  useEffect(() => {
    let didCancel = false;
    const timeoutId = setTimeout(() => {
      // Failsafe: if something hangs > 6s, allow navigation
      if (!didCancel) {
        setLoading(false);
        setInitialCheck(true);
      }
    }, 6000);

    // Wait for Clerk to load
    if (!isLoaded) {
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      if (!isSignedIn || !user) {
        setLoading(false);
        setInitialCheck(true);
        return;
      }
      checkUserProfile();
    }, 150);

    async function checkUserProfile() {
      if (user?.id) {
        try {
          // Set up Supabase session with Clerk token
          const token = await getToken({ template: 'supabase' });
          if (token) {
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: ''
            });
          }

          // Check onboarding and profile status using Clerk user ID
          const userAnswers = await getUserAnswers(user.id);
          const completed = hasCompletedOnboarding(userAnswers);
          
          setOnboardingCompleted(completed);
          setUserAnswers(userAnswers);

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
  }, [user, isLoaded, isSignedIn, getToken, location.pathname]);

  // If Clerk is still loading, show loading indicator
  if (!isLoaded || (!initialCheck && loading)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[rgba(253,248,242,1)]">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
        <p className="text-xl">Loading your profile...</p>
      </div>
    );
  }

  // If there's no user, redirect to auth page
  if (!isSignedIn || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Special handling for card page - allow access regardless of onboarding status
  if (location.pathname === "/card") {
    return <Outlet />;
  }

  // Check if the user is accessing the dashboard page
  if (location.pathname === "/dashboard") {
    if (!onboardingCompleted) {
      // Check if they should really be prevented from accessing dashboard
      if (userAnswers && (userAnswers.identity || userAnswers.career_path || userAnswers.user_type)) {
        // Allow access but show a soft message
        toast.info("Welcome back! Setting up your dashboard...");
      } else {
        // Really needs onboarding
        toast.info("Please complete onboarding first");
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
      }
    }
    
    // If onboarding complete but profile check failed to resolve, still allow access
    if (profileReady === false && !hasShownProfileNotification) {
      // Soft gate: nudge to profile but do not block access indefinitely
      const sessionKey = `profile_notification_shown_${user.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        toast.info("Complete your profile to unlock more features.");
        sessionStorage.setItem(sessionKey, 'true');
        setHasShownProfileNotification(true);
      }
    }
  }

  // If we get here, the user is authenticated, so allow access to the requested route
  return <Outlet />;
}
