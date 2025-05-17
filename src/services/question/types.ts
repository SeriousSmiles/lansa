
export interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface UserAnswers {
  question1?: string;
  question2?: string;
  question3?: string;
  gender?: string;
  age_group?: string;
  identity?: string;
  desired_outcome?: string;
  onboarding_completed?: boolean;
}
