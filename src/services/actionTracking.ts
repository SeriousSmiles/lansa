
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ActionType = 
  | 'profile_updated'
  | 'pitch_generated' 
  | 'profile_shared'
  | 'profile_viewed'
  | 'insight_opened'
  | 'insight_interacted'
  | 'onboarding_completed'
  | 'dashboard_visited';

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
    } else {
      console.log(`Tracked action: ${actionType}`, metadata);
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

    // Process actions into summary
    const summary = {
      totalActions: data?.length || 0,
      lastActions: data?.slice(0, 10) || [],
      actionCounts: {} as Record<ActionType, number>,
      lastActionDates: {} as Record<ActionType, string>
    };

    data?.forEach(action => {
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
