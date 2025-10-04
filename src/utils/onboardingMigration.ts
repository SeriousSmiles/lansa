import { supabase } from "@/integrations/supabase/client";

/**
 * Automatically syncs old onboarding flag to new flag for backward compatibility
 * This prevents users from getting stuck when we migrate systems
 */
export async function migrateUserOnboardingStatus(userId: string): Promise<boolean> {
  try {
    // Fetch both old and new onboarding flags
    const [answersResult, profileResult] = await Promise.all([
      supabase
        .from("user_answers")
        .select("career_path_onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle()
    ]);

    const oldCompleted = answersResult.data?.career_path_onboarding_completed === true;
    const newCompleted = profileResult.data?.onboarding_completed === true;

    // If old flag is true but new flag is false, sync them
    if (oldCompleted && !newCompleted) {
      console.log("Migrating onboarding status for user:", userId);
      
      const { error } = await supabase
        .from("user_profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to migrate onboarding status:", error);
        return false;
      }

      return true; // Migration performed
    }

    return false; // No migration needed
  } catch (error) {
    console.error("Error in onboarding migration:", error);
    return false;
  }
}
