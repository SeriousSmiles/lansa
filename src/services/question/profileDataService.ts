
import { UserAnswers } from "./types";

export function getProfileRole(answer1: string | undefined, identity?: string): string {
  if (identity) {
    switch (identity) {
      case "Freelancer": return "Freelancer seeking recognition";
      case "Job-seeker": return "Job seeker finding their fit";
      case "Student": return "Student preparing for the future";
      case "Entrepreneur": return "Business owner seeking clarity";
      case "Visionary": return "Visionary creating impact";
    }
  }

  // Legacy fallback logic
  if (!answer1) return "Professional seeking clarity";
  
  if (answer1.includes("freelancer")) return "Freelancer seeking recognition";
  if (answer1.includes("job")) return "Job seeker finding their fit";
  if (answer1.includes("business")) return "Business owner seeking clarity";
  if (answer1.includes("student")) return "Student preparing for the future";
  
  return "Professional seeking clarity";
}

export function getProfileGoal(answer3?: string, desiredOutcome?: string): string {
  if (desiredOutcome) {
    return desiredOutcome;
  }
  
  return answer3 || "Gaining professional clarity";
}

// Function to determine if user has completed the multi-step onboarding
export function hasCompletedOnboarding(answers: UserAnswers | null): boolean {
  if (!answers) return false;
  
  // Check if legacy onboarding was completed
  if (answers.question3) {
    return true;
  }
  
  // Check if new multi-step onboarding was completed
  return Boolean(answers.gender && answers.age_group && answers.identity && answers.desired_outcome);
}
