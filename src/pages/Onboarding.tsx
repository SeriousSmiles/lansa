
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { questions, saveUserAnswers } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Onboarding() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleAnswer = async (answer: string) => {
    const questionId = questions[currentQuestion].id;
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // If this is the last question, save and navigate to results
    if (currentQuestion === questions.length - 1) {
      try {
        if (!user?.id) {
          toast.error("User not authenticated");
          return;
        }
        
        await saveUserAnswers(user.id, updatedAnswers);
        navigate("/result");
      } catch (error) {
        console.error("Failed to save answers:", error);
        toast.error("Failed to save your answers. Please try again.");
      }
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-16 items-center justify-between max-md:px-5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
        
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < currentQuestion 
                  ? "bg-[#FF6B4A]" 
                  : index === currentQuestion 
                    ? "border-2 border-[#FF6B4A]" 
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[600px] text-center">
          <h1 className="text-4xl font-semibold text-[#2E2E2E]">{currentQ.question}</h1>
          
          <div className="mt-12 flex flex-col gap-4">
            {currentQ.options.map((option, index) => (
              <Button 
                key={index} 
                onClick={() => handleAnswer(option)}
                className="py-6 h-auto text-base font-normal"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
