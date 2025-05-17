
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUserAnswers, getInsightFromAnswers } from "@/services/question";
import { useAuth } from "@/contexts/AuthContext";

export default function Result() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadResults() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setInsight(getInsightFromAnswers(answers));
      }
      setIsLoading(false);
    }
    
    loadResults();
  }, [user]);

  const handleGetStartedWithActions = () => {
    // Set navigating state to prevent multiple clicks
    setIsNavigating(true);
    
    // Navigate to dashboard and store flag to highlight recommended actions
    localStorage.setItem('highlightRecommendedActions', 'true');
    
    // Add a small delay to ensure localStorage is set before navigation
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleGoToDashboard = () => {
    // Set navigating state to prevent multiple clicks
    setIsNavigating(true);
    
    // Add a small delay for consistency with the other button
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Analyzing your responses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-16 items-center max-md:px-5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[700px] text-center">
          <h1 className="text-4xl font-semibold text-[#2E2E2E] mb-6">Your Personalized Insight</h1>
          
          <p className="text-xl text-[#2E2E2E] mb-6 opacity-75">
            Based on the answers you provided during onboarding
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-lg mb-10 text-left">
            <p className="text-2xl text-[#2E2E2E] italic">"{insight}"</p>
          </div>
          
          <p className="text-xl text-[#2E2E2E] mb-10">
            We've prepared a starter profile for you based on your responses. This is just the beginning of your clarity journey.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={handleGetStartedWithActions} 
              className="px-8 py-6 h-auto text-lg"
              disabled={isNavigating}
            >
              {isNavigating ? 'Redirecting...' : 'Get Started with Actions'}
            </Button>
            <Button 
              onClick={handleGoToDashboard} 
              variant="outline" 
              className="px-8 py-6 h-auto text-lg"
              disabled={isNavigating}
            >
              {isNavigating ? 'Redirecting...' : 'Go to Dashboard'}
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
