
export interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface UserAnswers {
  gender?: string;
  age_group?: string;
  identity?: string;
  desired_outcome?: string;
  ai_insight?: string;
  onboarding_inputs?: any;
  ai_onboarding_card?: any;
  user_type?: 'job_seeker' | 'employer';
  career_path?: 'student' | 'visionary' | 'entrepreneur' | 'freelancer' | 'business';
  career_path_onboarding_completed?: boolean;
}
