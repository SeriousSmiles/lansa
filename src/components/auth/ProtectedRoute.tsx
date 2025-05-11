
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
          // If user has answered at least one question, consider onboarding complete
          setHasCompletedOnboarding(
            userAnswers && 
            Boolean(userAnswers.question1 || userAnswers.question2 || userAnswers.question3)
          );
        } catch (error) {
          console.error("Failed to check onboarding status:", error);
          setHasCompletedOnboarding(false);
        }
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
    return <div className="flex items-center justify-center h-screen">
      <p className="text-xl">Loading...</p>
    </div>;
  }

  // If user is accessing the onboarding page but has already completed it,
  // redirect them to the dashboard
  if (location.pathname === "/onboarding" && hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and is trying to access any protected 
  // route other than onboarding, redirect to onboarding
  if (!hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
