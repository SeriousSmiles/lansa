
import { supabase } from "@/integrations/supabase/client";
import { getUserActionSummary, ActionType } from "./actionTracking";

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  message: string;
  priority: number;
  is_read: boolean;
  metadata: any;
  created_at: string;
  expires_at?: string;
  action_required?: string;
  navigation_target?: string;
}

export async function generateInsights(userId: string): Promise<Omit<AIInsight, 'id' | 'created_at'>[]> {
  try {
    const actionSummary = await getUserActionSummary(userId);
    if (!actionSummary) return [];

    // Get existing insights to avoid duplicates
    const existingInsights = await getUserInsights(userId);
    const existingTypes = existingInsights.map(insight => insight.insight_type);

    const insights: Omit<AIInsight, 'id' | 'created_at'>[] = [];
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Check for profile update nudge
    const lastProfileUpdate = actionSummary.lastActionDates.profile_updated;
    if (!existingTypes.includes('profile_maintenance') && 
        (!lastProfileUpdate || new Date(lastProfileUpdate) < twoWeeksAgo)) {
      insights.push({
        insight_type: 'profile_maintenance',
        title: 'Keep Your Profile Fresh',
        message: "It's been a while since you updated your profile. A quick refresh can make a big difference in how others see your professional story.",
        priority: 2,
        is_read: false,
        metadata: { lastUpdate: lastProfileUpdate },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        action_required: 'profile_updated',
        navigation_target: '/profile'
      });
    }

    // Check for pitch completion nudge
    const hasPitchGenerated = actionSummary.actionCounts.pitch_generated > 0;
    const hasProfileUpdated = actionSummary.actionCounts.profile_updated > 0;
    if (!existingTypes.includes('pitch_completion') && 
        hasPitchGenerated && !hasProfileUpdated) {
      insights.push({
        insight_type: 'pitch_completion',
        title: 'Complete Your Story',
        message: "You've generated a great pitch! Consider adding it to your profile to make your professional story complete.",
        priority: 1,
        is_read: false,
        metadata: { pitchCount: actionSummary.actionCounts.pitch_generated },
        expires_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        action_required: 'profile_updated',
        navigation_target: '/profile'
      });
    }

    // Check for sharing nudge
    const hasShared = actionSummary.actionCounts.profile_shared > 0;
    const hasViews = actionSummary.actionCounts.profile_viewed > 0;
    if (!existingTypes.includes('sharing_opportunity') && 
        hasViews && (!hasShared || new Date(actionSummary.lastActionDates.profile_shared || 0) < twoWeeksAgo)) {
      insights.push({
        insight_type: 'sharing_opportunity',
        title: 'Your Profile is Getting Noticed',
        message: "Your profile has been viewed recently! This might be a great time to share it with new connections.",
        priority: 1,
        is_read: false,
        metadata: { viewCount: actionSummary.actionCounts.profile_viewed },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        action_required: 'profile_shared',
        navigation_target: '/profile'
      });
    }

    // Check for onboarding completion
    const hasCompletedOnboarding = actionSummary.actionCounts.onboarding_completed > 0;
    if (!existingTypes.includes('complete_onboarding') && !hasCompletedOnboarding) {
      insights.push({
        insight_type: 'complete_onboarding',
        title: 'Complete Your Setup',
        message: "Finish setting up your profile to unlock all features and get the most out of Lansa.",
        priority: 3,
        is_read: false,
        metadata: {},
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        action_required: 'onboarding_completed',
        navigation_target: '/onboarding'
      });
    }

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

export async function getUserInsights(userId: string): Promise<AIInsight[]> {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user insights:', error);
    return [];
  }
}

export async function markInsightAsRead(insightId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking insight as read:', error);
  }
}

export async function saveInsightsToDatabase(userId: string, insights: Omit<AIInsight, 'id' | 'created_at'>[]): Promise<void> {
  try {
    if (insights.length === 0) return;

    const { error } = await supabase
      .from('ai_insights')
      .insert(insights.map(insight => ({
        user_id: userId,
        ...insight
      })));

    if (error) throw error;
  } catch (error) {
    console.error('Error saving insights to database:', error);
  }
}

export async function checkAndRemoveCompletedInsights(userId: string): Promise<void> {
  try {
    // Get current user actions to check completion status
    const actionSummary = await getUserActionSummary(userId);
    if (!actionSummary) return;

    // Get current insights
    const insights = await getUserInsights(userId);
    
    // Check each insight to see if its required action has been completed
    for (const insight of insights) {
      const actionRequired = insight.metadata?.action_required || insight.action_required;
      
      if (actionRequired && actionSummary.actionCounts[actionRequired as ActionType] > 0) {
        // Action has been completed, mark insight as read
        await markInsightAsRead(insight.id);
      }
    }
  } catch (error) {
    console.error('Error checking completed insights:', error);
  }
}
