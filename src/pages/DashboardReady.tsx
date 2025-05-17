
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardPageLayout } from "@/components/layouts/CardPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { toast } from "sonner";

export default function DashboardReady() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Verify user authentication and onboarding completion on page load
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        if (!user?.id) {
          toast.error("You must be logged in to access this page.");
          navigate("/auth", { replace: true });
          return;
        }
        
        const userAnswers = await getUserAnswers(user.id);
        const onboardingComplete = hasCompletedOnboarding(userAnswers);
        
        if (!onboardingComplete) {
          toast.error("Please complete the onboarding process first.");
          navigate("/onboarding", { replace: true });
          return;
        }
        
        // User is authenticated and has completed onboarding
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to verify access:", error);
        toast.error("There was an error checking your profile.");
        navigate("/auth", { replace: true });
      }
    };
    
    verifyAccess();
  }, [user, navigate]);
  
  const handleGoToDashboard = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);
  };
  
  return (
    <CardPageLayout isLoading={isLoading}>
      <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 w-full">
        <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
        
        <CardContent className="p-8">
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-4">
                Your Dashboard is Ready!
              </h2>
              <p className="text-lg text-[#2E2E2E]">
                We've built your personalized dashboard based on your profile information.
                You're all set to begin your professional clarity journey.
              </p>
            </div>
            
            <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A]">
              <p className="text-xl text-[#2E2E2E] font-medium">
                Your personalized dashboard contains tailored insights and action steps
                designed specifically for your professional goals.
              </p>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleGoToDashboard}
                className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg w-full md:w-auto"
                disabled={isTransitioning}
              >
                {isTransitioning ? 'Loading...' : 'Go to Dashboard'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardPageLayout>
  );
}
