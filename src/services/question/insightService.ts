
import { UserAnswers } from "./types";

export function getBasicInsightFromAnswers(answers: UserAnswers | null): string {
  if (!answers) return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";

  const identity = answers.identity;
  
  if (!identity) {
    return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";
  }

  // Personalized insights based on identity
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
