
import { UserAnswers } from "./types";

export function getProfileRole(identity?: string, careerPath?: string): string {
  // Priority: use identity first, then career path
  if (identity) {
    switch (identity) {
      case "Freelancer": return "Freelancer seeking recognition";
      case "Job-seeker": return "Job seeker finding their fit";
      case "Student": return "Student preparing for the future";
      case "Entrepreneur": return "Business owner seeking clarity";
      case "Visionary": return "Visionary creating impact";
    }
  }
  
  // Fallback to career path
  if (careerPath) {
    switch (careerPath) {
      case 'student': return "Student preparing for the future";
      case 'visionary': return "Visionary creating impact";
      case 'entrepreneur': return "Business owner seeking clarity";
      case 'freelancer': return "Freelancer seeking recognition";
      case 'business': return "Business professional";
      default: return careerPath;
    }
  }
  
  return "Professional seeking clarity";
}

export function getProfileGoal(desiredOutcome?: string): string {
  return desiredOutcome || "Gaining professional clarity";
}

// Function to determine if user has completed the career path onboarding
export function hasCompletedOnboarding(answers: UserAnswers | null): boolean {
  if (!answers) return false;
  
  // Check multiple possible completion indicators
  // Either career path onboarding OR AI onboarding should count as complete
  const hasCareerPathOnboarding = answers.career_path_onboarding_completed;
  const hasAIOnboarding = answers.ai_onboarding_card;
  const hasOnboardingInputs = answers.onboarding_inputs;
  const hasBasicInfo = answers.identity && answers.desired_outcome;
  const hasCareerPathInfo = answers.career_path && answers.user_type;
  
  // For OAuth users who have basic info but need full onboarding
  const isOAuthWithBasics = answers.user_type === 'job_seeker' && 
                           answers.identity && 
                           answers.desired_outcome && 
                           !hasCareerPathOnboarding;
  
  // OAuth users with just basic defaults should still go through onboarding
  if (isOAuthWithBasics && 
      answers.identity === 'Job-seeker' && 
      answers.desired_outcome === 'Land my ideal role') {
    return false;
  }
  
  return !!(
    hasCareerPathOnboarding || 
    hasAIOnboarding ||
    hasOnboardingInputs ||
    hasBasicInfo ||
    hasCareerPathInfo
  );
}

// Function to get a personalized insight based on user's answers
export function getInsightFromAnswers(answers: UserAnswers | null): string {
  if (!answers) return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";

  const identity = answers.identity;
  const desiredOutcome = answers.desired_outcome;
  
  if (!identity || !desiredOutcome) {
    return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";
  }

  // Simplified insights based on identity
  switch (identity) {
    case "Freelancer":
      return "The freelancers who get respect aren't just good — they're clear about their value and position themselves accordingly.";
    case "Job-seeker":
      return "When you understand how your unique strengths connect to market needs, you stop competing and start attracting the right opportunities.";
    case "Student":
      return "The most successful students don't wait for a degree to validate them — they actively curate experiences that showcase their unique perspective.";
    case "Entrepreneur":
      return "The entrepreneurs who break through fastest aren't necessarily the most innovative — they're the ones who make their innovation the easiest to understand and support.";
    case "Visionary":
      return "The visionaries who make the biggest impact aren't necessarily the boldest — they're the ones who learned to communicate their ideas in ways that build bridges rather than walls.";
    default:
      return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";
  }
}
