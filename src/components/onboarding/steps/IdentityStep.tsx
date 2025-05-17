
import { QuestionCard } from "../QuestionCard";
import { UserAnswers } from "@/services/QuestionService";

interface IdentityStepProps {
  identityQuestions: any[];
  userAnswers: UserAnswers;
  onSaveAnswer: (questionId: string, answer: string) => Promise<void>;
  onComplete: () => void;
  isSubmitting: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function IdentityStep({
  identityQuestions,
  userAnswers,
  onSaveAnswer,
  onComplete,
  isSubmitting,
  stepNumber,
  totalSteps
}: IdentityStepProps) {
  const currentQuestion = identityQuestions[0];

  const handleAnswer = async (answer: string) => {
    if (isSubmitting) return;
    
    const questionId = currentQuestion.id;
    
    // Save the answer
    await onSaveAnswer(questionId, answer);
    
    // Complete this step
    onComplete();
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
