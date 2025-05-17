
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAnswers } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import {
  DemographicsStep,
  IdentityStep,
  OutcomeStep,
  MagicMomentStep
} from "./steps";

interface MultiStepFormProps {
  initialAnswers: UserAnswers;
  onSaveAnswers: (userId: string, answers: UserAnswers) => Promise<{ success: boolean }>;
  demographicsQuestions: any[];
  identityQuestions: any[];
  outcomeQuestions: any[];
}

export function MultiStepForm({
  initialAnswers,
  onSaveAnswers,
  demographicsQuestions,
  identityQuestions,
  outcomeQuestions
}: MultiStepFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    currentStep,
    setCurrentStep,
    demographicsStep,
    setDemographicsStep,
    answers,
    updateAnswers,
    getCurrentStepNumber,
    getTotalSteps
  } = useOnboardingFlow({
    initialAnswers,
    demographicsQuestions
  });

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, demographicsStep]);

  // Handle saving an answer
  const handleSaveAnswer = async (questionId: string, answer: string) => {
    if (isSubmitting || !user?.id) return;

    // Update local state with the new answer
    updateAnswers(questionId, answer);
    
    // Update the answer in the database
    const updatedAnswers = { ...answers, [questionId]: answer };
    
    try {
      setIsSubmitting(true);
      await onSaveAnswers(user.id, updatedAnswers);
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle completion of the magic moment step
  const handleMagicMomentComplete = () => {
    // Navigate to the card page with the answer data
    navigate('/card', { 
      state: { 
        identity: answers.identity,
        desiredOutcome: answers.desired_outcome
      } 
    });
  };

  // Render the appropriate step
  const renderCurrentStep = () => {
    const stepNumber = getCurrentStepNumber();
    const totalSteps = getTotalSteps();

    if (currentStep === 'demographics') {
      return (
        <DemographicsStep
          demographicsQuestions={demographicsQuestions}
          initialDemographicsStep={demographicsStep}
          userAnswers={answers}
          onSaveAnswer={handleSaveAnswer}
          onComplete={(nextDemographicsStep) => setDemographicsStep(nextDemographicsStep)}
          isSubmitting={isSubmitting}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
        />
      );
    } else if (currentStep === 'identity') {
      return (
        <IdentityStep
          identityQuestions={identityQuestions}
          userAnswers={answers}
          onSaveAnswer={handleSaveAnswer}
          onComplete={() => setCurrentStep('outcome')}
          isSubmitting={isSubmitting}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
        />
      );
    } else if (currentStep === 'outcome') {
      return (
        <OutcomeStep
          outcomeQuestions={outcomeQuestions}
          userAnswers={answers}
          onSaveAnswer={handleSaveAnswer}
          onComplete={() => setCurrentStep('magic-moment')}
          isSubmitting={isSubmitting}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
        />
      );
    } else if (currentStep === 'magic-moment') {
      return (
        <MagicMomentStep
          userAnswers={answers}
          onComplete={handleMagicMomentComplete}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      {renderCurrentStep()}
    </div>
  );
}

// Add missing import
import { useEffect } from "react";
