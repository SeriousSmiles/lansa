
import { useState, useEffect } from "react";
import { UserAnswers } from "@/services/QuestionService";

type Step = 'demographics' | 'identity' | 'outcome' | 'magic-moment';

interface UseOnboardingFlowProps {
  initialAnswers: UserAnswers;
  demographicsQuestions: any[];
}

export function useOnboardingFlow({ initialAnswers, demographicsQuestions }: UseOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('demographics');
  const [demographicsStep, setDemographicsStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);

  // Check if user has already completed some steps and advance accordingly
  useEffect(() => {
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

  // Update answers with a new answer
  const updateAnswers = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
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

  return {
    currentStep,
    setCurrentStep,
    demographicsStep,
    setDemographicsStep,
    answers,
    updateAnswers,
    getCurrentStepNumber,
    getTotalSteps
  };
}
