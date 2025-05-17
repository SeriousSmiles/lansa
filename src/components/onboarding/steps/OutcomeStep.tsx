
import { QuestionCard } from "../QuestionCard";
import { UserAnswers } from "@/services/QuestionService";

interface OutcomeStepProps {
  outcomeQuestions: any[];
  userAnswers: UserAnswers;
  onSaveAnswer: (questionId: string, answer: string) => Promise<void>;
  onComplete: () => void;
  isSubmitting: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function OutcomeStep({
  outcomeQuestions,
  userAnswers,
  onSaveAnswer,
  onComplete,
  isSubmitting,
  stepNumber,
  totalSteps
}: OutcomeStepProps) {
  const currentQuestion = outcomeQuestions[0];

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
