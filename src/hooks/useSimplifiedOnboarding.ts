import { useState } from "react";
import { UserAnswers } from "@/services/question/types";

interface UseSimplifiedOnboardingProps {
  initialAnswers: UserAnswers;
}

export function useSimplifiedOnboarding({ initialAnswers }: UseSimplifiedOnboardingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);

  // Check if we already have answers and should start from a later question
  const getInitialQuestionIndex = () => {
    if (!answers.desired_outcome) return 0;
    if (!answers.identity) return 1;
    return 2; // Both answered, ready to complete
  };

  const [initialIndex] = useState(getInitialQuestionIndex);

  // Update answers with a new answer
  const updateAnswers = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const moveToNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const isComplete = () => {
    return answers.desired_outcome && answers.identity;
  };

  return {
    currentQuestionIndex: Math.max(currentQuestionIndex, initialIndex),
    answers,
    updateAnswers,
    moveToNextQuestion,
    isComplete,
    totalQuestions: 2
  };
}