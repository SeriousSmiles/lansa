
import { supabase } from "@/integrations/supabase/client";

export type ActionType = 
  // Core navigation
  | 'dashboard_visited'
  | 'onboarding_completed'
  | 'recommended_action_clicked'
  // Profile & visibility
  | 'profile_updated'
  | 'profile_shared'
  | 'pitch_generated'
  | 'visible_to_employers_enabled'
  // AI tools (seeker)
  | 'power_skill_reframed'
  | 'ai_mirror_used'
  | 'story_created'
  | 'insight_opened'
  | 'insight_interacted'
  // Planning & growth
  | 'goal_90day_created'
  | 'growth_prompt_completed'
  // Resume
  | 'resume_exported'
  // Jobs (seeker)
  | 'job_applied'
  | 'job_swiped'
  // Certification
  | 'certification_started'
  | 'certification_completed'
  // Employer actions
  | 'job_posted'
  | 'application_reviewed'
  | 'candidate_accepted'
  | 'candidate_rejected';

export interface ActionMetadata {
  [key: string]: any;
}

export async function trackUserAction(
  actionType: ActionType,
  metadata: ActionMetadata = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot track action: user not authenticated');
      return;
    }

    const { error } = await supabase
      .from('user_actions')
      .insert({
        user_id: user.id,
        action_type: actionType,
        metadata
      });

    if (error) {
      console.error('Failed to track user action:', error);
    }
  } catch (error) {
    console.error('Error tracking user action:', error);
  }
}

export async function getUserActionSummary(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('action_type, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const summary = {
      totalActions: data?.length || 0,
      lastActions: data?.slice(0, 10) || [],
      actionCounts: {} as Record<ActionType, number>,
      lastActionDates: {} as Record<ActionType, string>
    };

    data?.forEach((action) => {
      const type = action.action_type as ActionType;
      summary.actionCounts[type] = (summary.actionCounts[type] || 0) + 1;
      
      if (!summary.lastActionDates[type]) {
        summary.lastActionDates[type] = action.created_at;
      }
    });

    return summary;
  } catch (error) {
    console.error('Error getting user action summary:', error);
    return null;
  }
}
