
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { 
  getUserAnswers, 
  saveUserAnswers, 
  demographicsQuestions,
  identityQuestions,
  outcomeQuestions
} from "@/services/QuestionService";
import { MultiStepForm } from "@/components/onboarding/MultiStepForm";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const answers = await getUserAnswers(user.id);
        console.log("Loaded existing user answers:", answers);
        
        if (answers) {
          setUserAnswers(answers);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user answers:", error);
        toast.error("Failed to load your data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    loadUserAnswers();
  }, [user]);

  const handleSaveAnswers = async (userId: string, answers: any) => {
    try {
      const result = await saveUserAnswers(userId, answers);
      if (!result.success) {
        toast.error("Failed to save your answers. Please try again.");
        return { success: false };
      }
      return result;
    } catch (error) {
      console.error("Error in save answers handler:", error);
      toast.error("Failed to save your answers. Please try again.");
      return { success: false };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Setting up your onboarding experience...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <MultiStepForm
          initialAnswers={userAnswers}
          onSaveAnswers={handleSaveAnswers}
          demographicsQuestions={demographicsQuestions}
          identityQuestions={identityQuestions}
          outcomeQuestions={outcomeQuestions}
        />
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
