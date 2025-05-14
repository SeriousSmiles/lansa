
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getMagicMoment } from "@/utils/magicMomentUtils";
import { useAuth } from "@/contexts/auth";
import { getUserAnswers } from "@/services/QuestionService";

export default function CardPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<string | undefined>(state?.identity);
  const [desiredOutcome, setDesiredOutcome] = useState<string | undefined>(state?.desiredOutcome);

  useEffect(() => {
    // If we don't have state from navigation, try to load from user answers
    async function loadUserData() {
      if (!state?.identity && user?.id) {
        try {
          const answers = await getUserAnswers(user.id);
          if (answers) {
            setIdentity(answers.identity);
            setDesiredOutcome(answers.desired_outcome);
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
      setIsLoading(false);
    }
    
    loadUserData();
  }, [state, user]);

  const magicMoment = getMagicMoment(identity, desiredOutcome);

  const handleGetStartedWithActions = () => {
    // Navigate to dashboard and store flag to highlight recommended actions
    localStorage.setItem('highlightRecommendedActions', 'true');
    navigate('/dashboard');
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
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
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
                >
                  Get Started with Actions
                </Button>
                
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="text-lg py-6 px-8 h-auto rounded-lg"
                >
                  Go to Dashboard
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
