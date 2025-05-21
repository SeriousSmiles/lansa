import { UserAnswers } from "./types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets a basic insight message based on the user's identity
 */
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

/**
 * Generates an AI-powered insight based on the user's profile data
 */
export async function generateAIInsight(
  userId: string, 
  identity?: string, 
  goal?: string, 
  blocker?: string,
  gender?: string,
  age_group?: string
): Promise<string> {
  try {
    // Call the Edge Function to generate insight
    const { data, error } = await supabase.functions.invoke('generate-insight', {
      body: {
        userId,
        identity,
        goal,
        blocker,
        gender,
        age_group
      }
    });

    if (error) {
      console.error('Error generating AI insight:', error);
      // Fallback to basic insight
      return getBasicInsightFromAnswers({ identity, desired_outcome: goal });
    }

    return data?.insight || getBasicInsightFromAnswers({ identity, desired_outcome: goal });
  } catch (e) {
    console.error('Exception when generating AI insight:', e);
    // Fallback to basic insight
    return getBasicInsightFromAnswers({ identity, desired_outcome: goal });
  }
}

/**
 * Gets the AI-generated insight from the user's answers, or generates a new one if not available
 */
export async function getPersonalizedInsight(
  userId: string,
  answers: UserAnswers | null
): Promise<string> {
  // If we already have a stored AI insight, use it
  if (answers?.ai_insight) {
    return answers.ai_insight;
  }
  
  // Otherwise generate a new insight
  return generateAIInsight(
    userId,
    answers?.identity,
    answers?.desired_outcome,
    answers?.question2,
    answers?.gender,
    answers?.age_group
  );
}
