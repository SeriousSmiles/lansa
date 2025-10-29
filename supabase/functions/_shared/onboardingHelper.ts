import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

/**
 * Mark user onboarding as complete in both new and legacy systems
 */
export async function markOnboardingComplete(
  supabase: SupabaseClient,
  userId: string,
  userType: 'job_seeker' | 'employer'
): Promise<void> {
  console.log(`[onboardingHelper] Marking onboarding complete for user ${userId} (${userType})`);

  // Update user_profiles.onboarding_completed (new system)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (profileError) {
    console.error('[onboardingHelper] Error updating user_profiles:', profileError);
    throw profileError;
  }

  // Update user_answers.career_path_onboarding_completed (legacy system)
  const { error: answersError } = await supabase
    .from('user_answers')
    .upsert({
      user_id: userId,
      user_type: userType,
      career_path_onboarding_completed: true,
    }, {
      onConflict: 'user_id'
    });

  if (answersError) {
    console.error('[onboardingHelper] Error updating user_answers:', answersError);
    // Don't throw, just log - this is legacy compatibility
  }

  // Log onboarding completion event
  const { error: logError } = await supabase
    .from('user_actions')
    .insert({
      user_id: userId,
      action_type: 'onboarding_completed',
      metadata: {
        user_type: userType,
        completion_method: 'organization_join',
        timestamp: new Date().toISOString(),
      },
    });

  if (logError) {
    console.error('[onboardingHelper] Error logging onboarding completion:', logError);
    // Don't throw, logging is non-critical
  }

  console.log(`[onboardingHelper] Successfully marked onboarding complete for user ${userId}`);
}
