
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { getProfileStatus } from "@/services/profileStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute() {
  const { user, updateDisplayName, loading: authLoading } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any>(null); // Add for debugging
  const [hasShownProfileNotification, setHasShownProfileNotification] = useState(false);

  useEffect(() => {
    let didCancel = false;
    const timeoutId = setTimeout(() => {
      // Failsafe: if something hangs > 6s, allow navigation and let routes handle finer checks
      if (!didCancel) {
        setLoading(false);
        setInitialCheck(true);
      }
    }, 6000);

    // Check if we're still processing OAuth tokens
    const isProcessingOAuth = window.location.href.includes('#access_token=');
    
    console.log("ProtectedRoute: Starting check", {
      hasUser: !!user,
      authLoading,
      isProcessingOAuth,
      currentPath: location.pathname
    });

    // Wait for auth context to finish loading and OAuth processing
    if (authLoading || isProcessingOAuth) {
      console.log("ProtectedRoute: Waiting for auth processing to complete");
      // Clean up timeout and return early
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      if (!user) {
        console.log("ProtectedRoute: No user after auth processing, allowing redirect");
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
          console.log("ProtectedRoute: User answers:", userAnswers);
          
          const completed = hasCompletedOnboarding(userAnswers);
          console.log("ProtectedRoute: Onboarding completed:", completed);
          
          setOnboardingCompleted(completed);
          setUserAnswers(userAnswers); // Store for debugging

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
  }, [user, updateDisplayName, authLoading, location.pathname]);

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
    console.log("ProtectedRoute: No user found, redirecting to auth", { 
      currentPath: location.pathname,
      initialCheck,
      loading 
    });
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
      console.log("Dashboard access denied - onboarding not completed");
      console.log("User answers:", userAnswers);
      
      // Check if they should really be prevented from accessing dashboard
      // Maybe they have valid data but the completion flag isn't set correctly
      if (userAnswers && (userAnswers.identity || userAnswers.career_path || userAnswers.user_type)) {
        console.log("User has onboarding data, allowing dashboard access and updating completion flag");
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
      // Only show this notification once per session
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
