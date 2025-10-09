/**
 * Onboarding Flow Registry
 * Define all possible onboarding flows and their routing rules in one place
 * Makes it trivial to add new user types and onboarding paths
 */

import { UserType, CareerPath } from '@/services/navigation/onboardingNavigationService';

export type OnboardingStep = 
  | 'demographics' 
  | 'skill_reframe' 
  | '90day_goal' 
  | 'power_mirror'
  | 'company_info'
  | 'role'
  | 'logo'
  | 'industry'
  | 'identity'
  | 'outcome';

export interface OnboardingFlow {
  userType: UserType;
  careerPath?: CareerPath;
  requiredSteps: OnboardingStep[];
  postOnboardingDestination: string;
  allowedNextSteps?: OnboardingStep[];
  estimatedDurationMinutes: number;
  description: string;
}

/**
 * Registry of all onboarding flows
 * Add new flows here when introducing new user types or paths
 */
export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    userType: 'job_seeker',
    careerPath: 'student',
    requiredSteps: ['demographics', 'skill_reframe', '90day_goal', 'power_mirror'],
    postOnboardingDestination: '/profile',
    estimatedDurationMinutes: 8,
    description: 'Student onboarding with AI-powered skill reframing'
  },
  {
    userType: 'job_seeker',
    careerPath: 'professional',
    requiredSteps: ['identity', 'outcome'],
    postOnboardingDestination: '/profile',
    estimatedDurationMinutes: 5,
    description: 'Professional job seeker onboarding'
  },
  {
    userType: 'employer',
    requiredSteps: ['company_info', 'role', 'logo', 'industry'],
    postOnboardingDestination: '/employer-dashboard',
    estimatedDurationMinutes: 6,
    description: 'Employer onboarding for hiring managers'
  },
  // Future flows can be added here:
  // {
  //   userType: 'freelancer',
  //   requiredSteps: ['skills', 'portfolio', 'rates'],
  //   postOnboardingDestination: '/freelancer-dashboard',
  //   estimatedDurationMinutes: 10,
  //   description: 'Freelancer onboarding with portfolio setup'
  // }
];

/**
 * Get the onboarding flow for a specific user type and career path
 */
export function getOnboardingFlow(
  userType: UserType,
  careerPath?: CareerPath
): OnboardingFlow | null {
  return ONBOARDING_FLOWS.find(
    flow => 
      flow.userType === userType && 
      (flow.careerPath === careerPath || !flow.careerPath)
  ) || null;
}

/**
 * Get all available onboarding flows for a user type
 */
export function getAvailableFlows(userType: UserType): OnboardingFlow[] {
  return ONBOARDING_FLOWS.filter(flow => flow.userType === userType);
}

/**
 * Calculate progress percentage based on completed steps
 */
export function calculateProgress(
  completedSteps: OnboardingStep[],
  flow: OnboardingFlow
): number {
  if (flow.requiredSteps.length === 0) return 100;
  
  const completedCount = completedSteps.filter(step => 
    flow.requiredSteps.includes(step)
  ).length;
  
  return Math.round((completedCount / flow.requiredSteps.length) * 100);
}

/**
 * Get the next step in the onboarding flow
 */
export function getNextStep(
  completedSteps: OnboardingStep[],
  flow: OnboardingFlow
): OnboardingStep | null {
  const nextStep = flow.requiredSteps.find(step => 
    !completedSteps.includes(step)
  );
  
  return nextStep || null;
}

/**
 * Validate if all required steps are completed
 */
export function isFlowComplete(
  completedSteps: OnboardingStep[],
  flow: OnboardingFlow
): boolean {
  return flow.requiredSteps.every(step => completedSteps.includes(step));
}
