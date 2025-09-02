import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { QuestionCard } from "./QuestionCard";
import TextQuestionCard from "./TextQuestionCard";
import { UserAnswers } from "@/services/question/types";
import { identityQuestions, outcomeQuestions } from "@/services/question/questionData";

interface EnhancedOnboardingFormProps {
  initialAnswers: UserAnswers;
  onSaveAnswers: (userId: string, answers: UserAnswers) => Promise<{ success: boolean }>;
}

const EnhancedOnboardingForm: React.FC<EnhancedOnboardingFormProps> = ({ initialAnswers, onSaveAnswers }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState(0);
  const totalSteps = 5; // identity, outcome, aspiration, challenges, expectations

  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers || {});
  const [inputs, setInputs] = useState<Record<string, any>>(initialAnswers?.onboarding_inputs || {});

  const userId = user?.id;

  const persist = async (partial: Partial<UserAnswers>, partialInputs?: Record<string, any>) => {
    if (!userId) return;
    const nextInputs = { ...(answers.onboarding_inputs || inputs), ...(partialInputs || {}) };
    const next: UserAnswers = { ...answers, ...partial, onboarding_inputs: nextInputs };
    setAnswers(next);
    setInputs(nextInputs);
    setIsSubmitting(true);
    try {
      await onSaveAnswers(userId, next);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentity = async (value: string) => {
    await persist({ identity: value });
    setStep(1);
  };

  const handleOutcome = async (value: string) => {
    await persist({ desired_outcome: value });
    setStep(2);
  };

  const handleAspiration = async (value: string) => {
    await persist({}, { aspiration_text: value });
    setStep(3);
  };

  const handleChallenges = async (value: string) => {
    await persist({}, { challenges_text: value });
    setStep(4);
  };

  const handleExpectations = async (value: string) => {
    await persist({ career_path_onboarding_completed: true }, { expectations_text: value });
    // After last step, go to card page
    navigate('/card', {
      state: { identity: answers.identity, desiredOutcome: answers.desired_outcome }
    });
  };

  const identity = identityQuestions[0];
  const outcome = outcomeQuestions[0];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[1100px] mx-auto">
      {step === 0 && (
        <QuestionCard
          question={identity.question}
          options={identity.options}
          onAnswer={handleIdentity}
          isSubmitting={isSubmitting}
          stepNumber={1}
          totalSteps={totalSteps}
        />
      )}
      {step === 1 && (
        <QuestionCard
          question={outcome.question}
          options={outcome.options}
          onAnswer={handleOutcome}
          isSubmitting={isSubmitting}
          stepNumber={2}
          totalSteps={totalSteps}
        />
      )}
      {step === 2 && (
        <TextQuestionCard
          title="In one sentence, where do you want to go?"
          helper="Use clear language. This helps us capture your aspiration in your own words."
          placeholder="e.g., Become a sought-after product designer known for elegant, human-centered work."
          defaultValue={inputs.aspiration_text}
          isSubmitting={isSubmitting}
          stepNumber={3}
          totalSteps={totalSteps}
          onSubmit={handleAspiration}
        />
      )}
      {step === 3 && (
        <TextQuestionCard
          title="What's blocking you right now?"
          helper="Briefly describe your biggest challenges so we can focus on what matters first."
          placeholder="e.g., Weak portfolio narrative, unclear positioning, low confidence in outreach."
          defaultValue={inputs.challenges_text}
          isSubmitting={isSubmitting}
          stepNumber={4}
          totalSteps={totalSteps}
          onSubmit={handleChallenges}
        />
      )}
      {step === 4 && (
        <TextQuestionCard
          title="Over the next 30 days, what should Lansa help you achieve?"
          helper="Set a practical expectation so your plan is focused and actionable."
          placeholder="e.g., Clarify my niche and publish a compelling profile that attracts design leads."
          defaultValue={inputs.expectations_text}
          isSubmitting={isSubmitting}
          stepNumber={5}
          totalSteps={totalSteps}
          onSubmit={handleExpectations}
        />
      )}
    </div>
  );
};

export default EnhancedOnboardingForm;
