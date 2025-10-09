import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAnswers } from "@/services/question/types";
import { useAuth } from "@/contexts/AuthContext";
import { useSimplifiedOnboarding } from "@/hooks/useSimplifiedOnboarding";
import { QuestionCard } from "./QuestionCard";
import { essentialQuestions } from "@/services/question/questionData";

interface SimplifiedOnboardingFormProps {
  initialAnswers: UserAnswers;
  onSaveAnswers: (userId: string, answers: UserAnswers) => Promise<{ success: boolean }>;
}

export function SimplifiedOnboardingForm({
  initialAnswers,
  onSaveAnswers
}: SimplifiedOnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    currentQuestionIndex,
    answers,
    updateAnswers,
    moveToNextQuestion,
    isComplete,
    totalQuestions
  } = useSimplifiedOnboarding({ initialAnswers });

  // Handle saving an answer and moving to next question
  const handleAnswer = async (answer: string) => {
    if (isSubmitting || !user?.id) return;

    const currentQuestion = essentialQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      setIsSubmitting(true);
      
      // Update local state
      updateAnswers(currentQuestion.id, answer);
      
      // Save to database
      const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
      await onSaveAnswers(user.id, updatedAnswers);
      
      // Move to next question or complete
      if (currentQuestionIndex < totalQuestions - 1) {
        moveToNextQuestion();
      } else {
        // Mark onboarding as completed using unified service
        const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
        const { getPostOnboardingDestination } = await import('@/services/navigation/onboardingNavigationService');
        
        await markOnboardingComplete(user.id, 'job_seeker');
        
        const destination = getPostOnboardingDestination('job_seeker');
        navigate(destination, { replace: true });
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already complete, redirect to profile-starter using useEffect
  useEffect(() => {
    if (isComplete() && answers.career_path_onboarding_completed) {
      navigate('/profile-starter', { 
        state: { 
          identity: answers.identity,
          desired_outcome: answers.desired_outcome
        }
      });
    }
  }, [isComplete, answers, navigate]);

  const currentQuestion = essentialQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    // All questions answered, handle completion
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Almost there!</h2>
        <p>Setting up your personalized experience...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[1100px] mx-auto">
      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        stepNumber={currentQuestionIndex + 1}
        totalSteps={totalQuestions}
      />
    </div>
  );
}