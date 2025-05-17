
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
