
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/QuestionService";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user?.id) {
        try {
          const userAnswers = await getUserAnswers(user.id);
          console.log("User answers for onboarding check:", userAnswers);
          
          // Check if onboarding is complete using our helper function
          const isComplete = hasCompletedOnboarding(userAnswers);
          console.log("Has completed onboarding:", isComplete);
          
          setOnboardingStatus(isComplete);
        } catch (error) {
          console.error("Failed to check onboarding status:", error);
          setOnboardingStatus(false);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    }

    if (user) {
      checkOnboardingStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Always allow authenticated users to access the dashboard
  if (location.pathname === "/dashboard" && user) {
    return <Outlet />;
  }

  if (!user) {
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

  // If user is accessing the onboarding or card page but has already completed onboarding,
  // redirect them to the dashboard
  if ((location.pathname === "/onboarding" || location.pathname === "/card") && onboardingStatus) {
    console.log("User has completed onboarding, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding or card, redirect to onboarding
  // BUT always allow access to dashboard
  if (onboardingStatus === false && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/card" &&
      location.pathname !== "/dashboard") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
