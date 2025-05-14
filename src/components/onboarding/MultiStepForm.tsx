
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserAnswers } from "@/services/QuestionService";
import { useAuth } from "@/contexts/auth";
import { QuestionCard } from "./QuestionCard";
import { MagicMomentCard } from "./MagicMomentCard";

interface MultiStepFormProps {
  initialAnswers: UserAnswers;
  onSaveAnswers: (userId: string, answers: UserAnswers) => Promise<{ success: boolean }>;
  demographicsQuestions: any[];
  identityQuestions: any[];
  outcomeQuestions: any[];
}

type Step = 'demographics' | 'identity' | 'outcome' | 'magic-moment';

export function MultiStepForm({
  initialAnswers,
  onSaveAnswers,
  demographicsQuestions,
  identityQuestions,
  outcomeQuestions
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('demographics');
  const [demographicsStep, setDemographicsStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already completed some steps and advance accordingly
    if (answers.gender && answers.age_group && demographicsStep === 0) {
      // Demographics completed
      if (answers.identity) {
        // Identity completed
        if (answers.desired_outcome) {
          // All steps completed, show magic moment
          setCurrentStep('magic-moment');
        } else {
          // Show outcome step
          setCurrentStep('outcome');
        }
      } else {
        // Show identity step
        setCurrentStep('identity');
      }
    } else if (demographicsStep >= demographicsQuestions.length) {
      // User completed all demographics questions in this session
      setCurrentStep('identity');
    }
  }, [answers, demographicsStep, demographicsQuestions.length]);

  const handleDemographicsAnswer = async (answer: string) => {
    if (isSubmitting) return;

    const questionId = demographicsQuestions[demographicsStep].id;
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // Save after each answer
    if (user?.id) {
      try {
        setIsSubmitting(true);
        await onSaveAnswers(user.id, updatedAnswers);
      } catch (error) {
        console.error("Failed to save demographics answer:", error);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Move to next question or step
    if (demographicsStep < demographicsQuestions.length - 1) {
      setDemographicsStep(demographicsStep + 1);
    } else {
      setCurrentStep('identity');
    }
  };

  const handleIdentityAnswer = async (answer: string) => {
    if (isSubmitting) return;

    const questionId = identityQuestions[0].id;
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // Save identity answer
    if (user?.id) {
      try {
        setIsSubmitting(true);
        await onSaveAnswers(user.id, updatedAnswers);
      } catch (error) {
        console.error("Failed to save identity answer:", error);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Move to outcome step
    setCurrentStep('outcome');
  };

  const handleOutcomeAnswer = async (answer: string) => {
    if (isSubmitting) return;

    const questionId = outcomeQuestions[0].id;
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // Save outcome answer and show magic moment
    if (user?.id) {
      try {
        setIsSubmitting(true);
        await onSaveAnswers(user.id, updatedAnswers);
        setCurrentStep('magic-moment');
      } catch (error) {
        console.error("Failed to save outcome answer:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep('magic-moment');
    }
  };

  const handleMagicMomentComplete = () => {
    // Navigate to the card page with the answer data
    navigate('/card', { 
      state: { 
        identity: answers.identity,
        desiredOutcome: answers.desired_outcome
      } 
    });
  };

  // Calculate current step number and total steps for progress indicator
  const getCurrentStepNumber = (): number => {
    switch (currentStep) {
      case 'demographics':
        return demographicsStep + 1;
      case 'identity':
        return demographicsQuestions.length + 1;
      case 'outcome':
        return demographicsQuestions.length + 2;
      case 'magic-moment':
        return demographicsQuestions.length + 3;
      default:
        return 1;
    }
  };

  const getTotalSteps = (): number => {
    // Demographics + Identity + Outcome + Magic Moment
    return demographicsQuestions.length + 3;
  };

  // Render the appropriate step
  const renderCurrentStep = () => {
    if (currentStep === 'demographics') {
      const currentQuestion = demographicsQuestions[demographicsStep];
      return (
        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          onAnswer={handleDemographicsAnswer}
          isSubmitting={isSubmitting}
          stepNumber={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
        />
      );
    } else if (currentStep === 'identity') {
      const currentQuestion = identityQuestions[0];
      return (
        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          onAnswer={handleIdentityAnswer}
          isSubmitting={isSubmitting}
          stepNumber={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
        />
      );
    } else if (currentStep === 'outcome') {
      const currentQuestion = outcomeQuestions[0];
      return (
        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          onAnswer={handleOutcomeAnswer}
          isSubmitting={isSubmitting}
          stepNumber={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
        />
      );
    } else if (currentStep === 'magic-moment') {
      return (
        <MagicMomentCard
          identity={answers.identity}
          desiredOutcome={answers.desired_outcome}
          onComplete={handleMagicMomentComplete}
          stepNumber={getCurrentStepNumber()}
          totalSteps={getTotalSteps()}
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
