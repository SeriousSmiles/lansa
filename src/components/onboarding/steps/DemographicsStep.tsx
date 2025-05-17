
import { useState } from "react";
import { QuestionCard } from "../QuestionCard";
import { UserAnswers } from "@/services/QuestionService";

interface DemographicsStepProps {
  demographicsQuestions: any[];
  initialDemographicsStep: number;
  userAnswers: UserAnswers;
  onSaveAnswer: (questionId: string, answer: string) => Promise<void>;
  onComplete: (nextDemographicsStep: number) => void;
  isSubmitting: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function DemographicsStep({
  demographicsQuestions,
  initialDemographicsStep,
  userAnswers,
  onSaveAnswer,
  onComplete,
  isSubmitting,
  stepNumber,
  totalSteps
}: DemographicsStepProps) {
  const [demographicsStep, setDemographicsStep] = useState(initialDemographicsStep);
  const currentQuestion = demographicsQuestions[demographicsStep];

  const handleAnswer = async (answer: string) => {
    if (isSubmitting) return;
    
    const questionId = currentQuestion.id;
    
    // Save the answer
    await onSaveAnswer(questionId, answer);
    
    // Move to next question or step
    if (demographicsStep < demographicsQuestions.length - 1) {
      setDemographicsStep(demographicsStep + 1);
      onComplete(demographicsStep + 1);
    } else {
      onComplete(demographicsStep + 1);
    }
  };

  return (
    <QuestionCard
      question={currentQuestion.question}
      options={currentQuestion.options}
      onAnswer={handleAnswer}
      isSubmitting={isSubmitting}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
    />
  );
}
