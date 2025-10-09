import { supabase } from "@/integrations/supabase/client";
import { error as logErrorUtil } from "@/utils/logger";

/**
 * Unified Onboarding Service
 * Single source of truth for marking onboarding complete across ALL user types
 * Ensures both flags are updated simultaneously for backward compatibility
 */

export async function markOnboardingComplete(
  userId: string,
  userType: 'job_seeker' | 'employer'
): Promise<void> {
  try {
    // Get user's auth metadata for name extraction
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logErrorUtil('Error getting user for onboarding completion');
      throw authError;
    }

    // Extract name from auth metadata
    let displayName = 'Lansa User';
    let firstName: string | undefined;
    let lastName: string | undefined;

    if (user) {
      firstName = user.user_metadata?.first_name;
      lastName = user.user_metadata?.last_name;
      const fullName = user.user_metadata?.full_name;
      
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
      } else if (fullName) {
        displayName = fullName;
      } else if (firstName) {
        displayName = firstName;
      }
    }

    // CRITICAL: Update ALL flags simultaneously for consistency
    // This eliminates the dual-flag problem by ensuring both are always in sync
    
    // 1. Update user_profiles.onboarding_completed (NEW FLAG - primary)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        onboarding_completed: true,
        name: displayName,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      logErrorUtil('Error updating user profile for onboarding completion');
      throw profileError;
    }

    // 2. Update user_answers with user_type and OLD FLAG (backward compatibility)
    const { error: answersError } = await supabase
      .from('user_answers')
      .upsert({
        user_id: userId,
        user_type: userType,
        career_path_onboarding_completed: true, // OLD FLAG - keep for migration period
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (answersError) {
      logErrorUtil('Error updating user answers for onboarding completion');
      // Rollback profile update if this fails
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: false })
        .eq('user_id', userId);
      throw answersError;
    }

    // 3. Log completion event for analytics
    const { error: actionLogError } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: 'onboarding_completed',
        metadata: {
          user_type: userType,
          completed_at: new Date().toISOString()
        }
      });

    // Don't throw on logging errors, just log them
    if (actionLogError) {
      console.error('Error logging onboarding completion event:', actionLogError);
    }

    console.log(`✅ Onboarding marked complete for user ${userId} (${userType})`);
  } catch (err) {
    logErrorUtil('Critical error in markOnboardingComplete');
    console.error('Onboarding completion error:', err);
    throw err;
  }
}

/**
 * Check if user has completed onboarding
 * Checks both flags for backward compatibility during migration
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const [profileResult, answersResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_answers')
        .select('career_path_onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    const newFlag = !!profileResult.data?.onboarding_completed;
    const oldFlag = !!answersResult.data?.career_path_onboarding_completed;

    // BACKWARD COMPATIBILITY: Consider complete if EITHER flag is true
    return newFlag || oldFlag;
  } catch (err) {
    console.error('Error checking onboarding status:', err);
    return false;
  }
}
