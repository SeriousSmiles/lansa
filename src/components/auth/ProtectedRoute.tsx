
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingTransitionModal } from "@/components/loading/LoadingTransitionModal";

export default function ProtectedRoute() {
  const { user, updateDisplayName } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dashboardTransitionHandled, setDashboardTransitionHandled] = useState(false);

  // Handle transition to dashboard once validation is complete
  const handleDashboardTransitionComplete = () => {
    setIsValidating(false);
    // Navigate to dashboard without forcing a page refresh
    window.history.replaceState({}, '', '/dashboard');
  };

  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      if (!user) {
        setLoading(false);
        setInitialCheck(true);
        return;
      }
      
      checkUserProfile();
    }, 150); // Increased delay to ensure auth state is fully loaded
    
    return () => clearTimeout(timer);
    
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
          
          // Only handle dashboard transition if we're directly accessing the dashboard
          // and not coming from the card page (which handles its own transition)
          if (completed && 
              location.pathname === "/dashboard" && 
              !dashboardTransitionHandled && 
              !sessionStorage.getItem('comingFromCardPage')) {
            setDashboardTransitionHandled(true);
          }
          
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
      setInitialCheck(true);
    }
  }, [user, updateDisplayName, location.pathname, dashboardTransitionHandled]);

  // Effect to handle dashboard transition state
  useEffect(() => {
    // Only trigger validation if we're ready, haven't handled it yet,
    // and not coming from the card page
    if (dashboardTransitionHandled && 
        !isValidating && 
        location.pathname === "/dashboard" && 
        !sessionStorage.getItem('comingFromCardPage')) {
      setIsValidating(true);
    }
  }, [dashboardTransitionHandled, isValidating, location.pathname]);

  // If we're still on the first load, show a more substantial loading indicator
  if (!initialCheck) {
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

  // Special handling for card page and dashboard-ready page - these are part of the onboarding flow
  // Allow access to these pages regardless of onboarding status
  if (location.pathname === "/card" || location.pathname === "/dashboard-ready") {
    console.log("On special page, allowing access regardless of onboarding status");
    return <Outlet />;
  }

  // Check if the user is accessing the dashboard page
  if (location.pathname === "/dashboard" && !onboardingCompleted) {
    console.log("User hasn't completed onboarding, redirecting to onboarding");
    toast.info("Please complete onboarding before accessing the dashboard");
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If we get here, the user is authenticated, so allow access to the requested route
  return (
    <>
      <LoadingTransitionModal 
        isOpen={isValidating} 
        isRefreshing={false}
        onComplete={handleDashboardTransitionComplete} 
      />
      <Outlet />
    </>
  );
}
