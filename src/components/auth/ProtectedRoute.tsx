
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers } from "@/services/QuestionService";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user?.id) {
        try {
          const userAnswers = await getUserAnswers(user.id);
          console.log("User answers for onboarding check:", userAnswers);
          
          // Consider onboarding complete if user has answered the last question (question3)
          const isComplete = userAnswers && Boolean(userAnswers.question3);
          console.log("Has completed onboarding:", isComplete);
          
          setHasCompletedOnboarding(isComplete);
        } catch (error) {
          console.error("Failed to check onboarding status:", error);
          setHasCompletedOnboarding(false);
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

  // If user is accessing the onboarding page but has already completed it,
  // redirect them to the dashboard
  if (location.pathname === "/onboarding" && hasCompletedOnboarding) {
    console.log("User has completed onboarding, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding, redirect to onboarding
  if (hasCompletedOnboarding === false && location.pathname !== "/onboarding") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
