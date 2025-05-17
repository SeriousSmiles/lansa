import { MagicMomentCard } from "../MagicMomentCard";
import { UserAnswers } from "@/services/question/types";

interface MagicMomentStepProps {
  userAnswers: UserAnswers;
  onComplete: () => void;
  stepNumber: number;
  totalSteps: number;
}

export function MagicMomentStep({
  userAnswers,
  onComplete,
  stepNumber,
  totalSteps
}: MagicMomentStepProps) {
  return (
    <MagicMomentCard
      identity={userAnswers.identity}
      desiredOutcome={userAnswers.desired_outcome}
      onComplete={onComplete}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
    />
  );
}
