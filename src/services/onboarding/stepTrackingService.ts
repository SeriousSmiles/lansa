/**
 * Step Tracking Service
 * Tracks which onboarding steps users have completed
 * Enables resume-from-where-you-left-off functionality
 */

import { supabase } from '@/integrations/supabase/client';
import { OnboardingStep } from './onboardingFlowRegistry';

export interface StepProgress {
  stepName: OnboardingStep;
  completedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Mark a specific onboarding step as completed
 */
export async function markStepComplete(
  userId: string,
  stepName: OnboardingStep,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: 'onboarding_step_completed',
        metadata: {
          step_name: stepName,
          completed_at: new Date().toISOString(),
          ...metadata
        }
      });

    if (error) throw error;
    
    console.log(`✅ Step "${stepName}" marked complete for user ${userId}`);
  } catch (err) {
    console.error('Error marking step complete:', err);
    throw err;
  }
}

/**
 * Get all completed steps for a user
 */
export async function getCompletedSteps(userId: string): Promise<OnboardingStep[]> {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('metadata')
      .eq('user_id', userId)
      .eq('action_type', 'onboarding_step_completed')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || [])
      .map(action => {
        const metadata = action.metadata as any;
        return metadata?.step_name;
      })
      .filter(Boolean) as OnboardingStep[];
  } catch (err) {
    console.error('Error getting completed steps:', err);
    return [];
  }
}

/**
 * Get detailed progress information
 */
export async function getStepProgress(userId: string): Promise<StepProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('metadata, created_at')
      .eq('user_id', userId)
      .eq('action_type', 'onboarding_step_completed')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(action => {
      const metadata = action.metadata as any;
      return {
        stepName: metadata?.step_name,
        completedAt: action.created_at,
        metadata: metadata
      };
    });
  } catch (err) {
    console.error('Error getting step progress:', err);
    return [];
  }
}

/**
 * Log when onboarding is started
 */
export async function logOnboardingStarted(
  userId: string,
  userType: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: 'onboarding_started',
        metadata: {
          user_type: userType,
          started_at: new Date().toISOString()
        }
      });

    if (error) throw error;
  } catch (err) {
    console.error('Error logging onboarding start:', err);
  }
}

/**
 * Clear all step progress (useful for testing or re-onboarding)
 */
export async function clearStepProgress(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_actions')
      .delete()
      .eq('user_id', userId)
      .in('action_type', ['onboarding_step_completed', 'onboarding_started']);

    if (error) throw error;
    
    console.log(`✅ Cleared step progress for user ${userId}`);
  } catch (err) {
    console.error('Error clearing step progress:', err);
    throw err;
  }
}
