import { supabase } from "@/integrations/supabase/client";

export interface OnboardingValidationResult {
  isComplete: boolean;
  hasUserType: boolean;
  hasCareerPath: boolean;
  hasMinimumProfile: boolean;
  missingFields: string[];
}

/**
 * Comprehensive onboarding validation service
 * Validates that a user has completed all required onboarding steps
 */
export async function validateOnboardingComplete(userId: string): Promise<OnboardingValidationResult> {
  try {
    // Fetch all required data in parallel
    const [profileResult, answersResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("onboarding_completed, name, title")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_answers")
        .select("user_type, career_path, career_path_onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle()
    ]);

    const missingFields: string[] = [];
    
    // Check onboarding flags (both new and old for backward compatibility)
    const newOnboardingComplete = !!profileResult.data?.onboarding_completed;
    const oldOnboardingComplete = !!answersResult.data?.career_path_onboarding_completed;
    const hasOnboardingFlags = newOnboardingComplete || oldOnboardingComplete;
    
    if (!hasOnboardingFlags) {
      missingFields.push("onboarding_completed flag");
    }

    // Check user type (CRITICAL - required for all users)
    const hasUserType = !!answersResult.data?.user_type;
    if (!hasUserType) {
      missingFields.push("user_type");
    }

    // Check career path (required for job seekers)
    const userType = answersResult.data?.user_type;
    const hasCareerPath = userType === 'employer' || !!answersResult.data?.career_path;
    if (userType === 'job_seeker' && !answersResult.data?.career_path) {
      missingFields.push("career_path");
    }

    // Check minimum profile data
    const hasMinimumProfile = !!(profileResult.data?.name);
    if (!profileResult.data?.name) {
      missingFields.push("profile name");
    }

    const isComplete = hasOnboardingFlags && hasUserType && hasCareerPath && hasMinimumProfile;

    return {
      isComplete,
      hasUserType,
      hasCareerPath,
      hasMinimumProfile,
      missingFields
    };
  } catch (error) {
    console.error("Error validating onboarding:", error);
    return {
      isComplete: false,
      hasUserType: false,
      hasCareerPath: false,
      hasMinimumProfile: false,
      missingFields: ["validation error"]
    };
  }
}

/**
 * Track analytics for onboarding attempts
 */
export async function logOnboardingEvent(
  userId: string, 
  eventType: 'started' | 'completed' | 'skipped' | 'resumed',
  metadata?: Record<string, any>
) {
  try {
    await supabase.from("user_actions").insert({
      user_id: userId,
      action_type: `onboarding_${eventType}`,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  } catch (error) {
    console.error("Failed to log onboarding event:", error);
  }
}

/**
 * Get the last incomplete onboarding step for resuming
 */
export async function getLastIncompleteStep(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("user_actions")
      .select("metadata")
      .eq("user_id", userId)
      .like("action_type", "onboarding_%")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const metadata = data?.metadata as Record<string, any> | null;
    return metadata?.last_step || null;
  } catch (error) {
    console.error("Failed to get last incomplete step:", error);
    return null;
  }
}
