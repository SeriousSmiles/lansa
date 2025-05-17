
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMagicMoment } from "@/utils/magicMomentUtils";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, saveUserAnswers } from "@/services/question";
import { LoadingTransitionModal } from "@/components/loading/LoadingTransitionModal";
import { toast } from "sonner";

export default function CardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<string | undefined>(state?.identity);
  const [desiredOutcome, setDesiredOutcome] = useState<string | undefined>(state?.desiredOutcome);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingMarked, setOnboardingMarked] = useState(false);

  // Mark onboarding as completed when this page loads
  useEffect(() => {
    async function markOnboardingCompleted() {
      if (user?.id && !onboardingMarked) {
        try {
          // Load current user answers
          const userAnswers = await getUserAnswers(user.id);
          if (userAnswers) {
            // Add onboarding_completed flag
            const updatedAnswers = {
              ...userAnswers,
              onboarding_completed: true
            };
            
            // Save the updated answers
            await saveUserAnswers(user.id, updatedAnswers);
            console.log("Onboarding marked as completed");
            setOnboardingMarked(true);
          }
        } catch (error) {
          console.error("Failed to mark onboarding as completed:", error);
          toast.error("Failed to update your profile. Please try again.");
        }
      }
    }
    
    markOnboardingCompleted();
    
    // Block navigation with browser's back button
    const handlePopState = (event: PopStateEvent) => {
      // Prevent going back
      event.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
      return false;
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    // Clean up event listener
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, navigate, onboardingMarked]);

  useEffect(() => {
    // Load user data if not provided via state
    async function loadUserData() {
      try {
        if (user?.id) {
          const answers = await getUserAnswers(user.id);
          if (answers) {
            setIdentity(answers.identity);
            setDesiredOutcome(answers.desired_outcome);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [user]);

  const magicMoment = getMagicMoment(identity, desiredOutcome);

  const handleGetStartedWithActions = async () => {
    if (isTransitioning) return;
    
    // Start transition and show loading modal
    setIsTransitioning(true);
    
    try {
      // Ensure onboarding is marked as completed
      if (!onboardingMarked && user?.id) {
        const userAnswers = await getUserAnswers(user.id);
        if (userAnswers) {
          await saveUserAnswers(user.id, {
            ...userAnswers,
            onboarding_completed: true
          });
        }
      }
      
      // Store flag to highlight recommended actions
      localStorage.setItem('highlightRecommendedActions', 'true');
      
      // Add artificial delay to show the loading states
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 10000); // Show loading for at least 10 seconds to display all statuses
      
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("An error occurred. Please try again.");
      setIsTransitioning(false);
    }
  };

  const handleGoToDashboard = async () => {
    if (isTransitioning) return;
    
    // Start transition and show loading modal
    setIsTransitioning(true);
    
    try {
      // Ensure onboarding is marked as completed
      if (!onboardingMarked && user?.id) {
        const userAnswers = await getUserAnswers(user.id);
        if (userAnswers) {
          await saveUserAnswers(user.id, {
            ...userAnswers,
            onboarding_completed: true
          });
        }
      }
      
      // Add artificial delay to show the loading states
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 10000); // Show loading for at least 10 seconds to display all statuses
      
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("An error occurred. Please try again.");
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your personalized insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      {/* Loading transition modal */}
      <LoadingTransitionModal isOpen={isTransitioning} />
      
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Lansa Logo"
            className="aspect-[2.7] object-contain w-[92px]"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] mb-8 text-center">
          Your Personal Blueprint
        </h1>
        
        <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 w-full">
          <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-4">
                  {magicMoment.title}
                </h2>
                <p className="text-lg text-[#2E2E2E]">{magicMoment.reflection}</p>
              </div>
              
              <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A]">
                <p className="text-xl text-[#2E2E2E] font-medium italic">
                  "{magicMoment.insight}"
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#2E2E2E]">
                  Next steps to increase your professional clarity:
                </h3>
                
                <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]">
                  <li>Complete your profile to highlight your unique strengths</li>
                  <li>Explore content tailored to your professional identity</li>
                  <li>Begin building your visibility strategy</li>
                  <li>Connect with others who share your professional goals</li>
                </ul>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
                <Button
                  onClick={handleGetStartedWithActions}
                  className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg"
                  disabled={isTransitioning}
                >
                  {isTransitioning ? 'Setting up...' : 'Get Started with Actions'}
                </Button>
                
                <Button
                  onClick={handleGoToDashboard}
                  variant="outline"
                  className="text-lg py-6 px-8 h-auto rounded-lg"
                  disabled={isTransitioning}
                >
                  {isTransitioning ? 'Setting up...' : 'Go to Dashboard'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
