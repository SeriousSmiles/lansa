
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers } from "./question";

export interface AIInsight {
  id: string;
  title: string;
  message: string;
  insight_type: string;
  priority: number;
  navigation_target?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

// Generate insights based on user's profile and actions
export async function generateInsights(userId: string): Promise<AIInsight[]> {
  try {
    const userAnswers = await getUserAnswers(userId);
    const insights: AIInsight[] = [];
    
    // Check what the user might need help with
    const profileInsight = await checkProfileCompleteness(userId);
    if (profileInsight) insights.push(profileInsight);
    
    const actionInsight = await checkRecommendedActions(userId, userAnswers);
    if (actionInsight) insights.push(actionInsight);
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

async function checkProfileCompleteness(userId: string): Promise<AIInsight | null> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!profile) {
      return {
        id: `profile-setup-${Date.now()}`,
        title: "Complete Your Profile",
        message: "Set up your professional profile to make a great first impression. Add your experience, skills, and personal details.",
        insight_type: "profile_setup",
        priority: 1,
        navigation_target: "/profile",
        is_read: false,
        created_at: new Date().toISOString()
      };
    }
    
    // Check for missing profile elements
    const missingElements = [];
    if (!profile.about_text) missingElements.push("about section");
    if (!profile.experiences || Object.keys(profile.experiences).length === 0) missingElements.push("work experience");
    if (!profile.skills || profile.skills.length === 0) missingElements.push("skills");
    if (!profile.profile_image) missingElements.push("profile photo");
    
    if (missingElements.length > 0) {
      return {
        id: `profile-incomplete-${Date.now()}`,
        title: "Enhance Your Profile",
        message: `Your profile is missing: ${missingElements.join(", ")}. Complete these sections to strengthen your professional presence.`,
        insight_type: "profile_enhancement",
        priority: 2,
        navigation_target: "/profile",
        is_read: false,
        created_at: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return null;
  }
}

async function checkRecommendedActions(userId: string, userAnswers: any): Promise<AIInsight | null> {
  try {
    // Check if user has tracked any actions recently
    const { data: recentActions } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    const role = userAnswers?.identity || "Professional";
    const goal = userAnswers?.desired_outcome || "Advance my career";
    
    // If no recent activity, suggest getting started
    if (!recentActions || recentActions.length === 0) {
      return {
        id: `get-started-${Date.now()}`,
        title: "Start Building Your Presence",
        message: `As a ${role.toLowerCase()} looking to ${goal.toLowerCase()}, begin by exploring your dashboard and completing your profile setup.`,
        insight_type: "get_started",
        priority: 1,
        navigation_target: "/dashboard",
        is_read: false,
        created_at: new Date().toISOString()
      };
    }
    
    // Check if they haven't visited their card recently
    const cardVisits = recentActions.filter(action => action.action_type === 'card_visited');
    if (cardVisits.length === 0) {
      return {
        id: `visit-card-${Date.now()}`,
        title: "Preview Your Professional Card",
        message: "See how your professional information looks to others. Your card is your digital business card that you can share with potential connections.",
        insight_type: "card_preview",
        priority: 2,
        navigation_target: "/card",
        is_read: false,
        created_at: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking recommended actions:', error);
    return null;
  }
}

export async function getUserInsights(userId: string): Promise<AIInsight[]> {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure all insights have proper navigation targets
    return (data || []).map(insight => ({
      ...insight,
      navigation_target: insight.metadata?.navigation_target || insight.navigation_target || "/dashboard"
    }));
  } catch (error) {
    console.error('Failed to fetch user insights:', error);
    return [];
  }
}

export async function saveInsightsToDatabase(userId: string, insights: AIInsight[]): Promise<void> {
  if (insights.length === 0) return;
  
  try {
    // Ensure each insight has a proper navigation target before saving
    const insightsToSave = insights.map(insight => ({
      user_id: userId,
      title: insight.title,
      message: insight.message,
      insight_type: insight.insight_type,
      priority: insight.priority,
      metadata: {
        navigation_target: insight.navigation_target || "/dashboard",
        ...insight.metadata
      },
      is_read: false,
      expires_at: insight.expires_at || null
    }));
    
    const { error } = await supabase
      .from('ai_insights')
      .insert(insightsToSave);
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save insights to database:', error);
    throw error;
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
    console.error('Failed to mark insight as read:', error);
    throw error;
  }
}

export async function checkAndRemoveCompletedInsights(userId: string): Promise<void> {
  try {
    // Get user's recent actions to determine what they've completed
    const { data: recentActions } = await supabase
      .from('user_actions')
      .select('action_type')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (!recentActions) return;
    
    const completedActions = new Set(recentActions.map(action => action.action_type));
    
    // Mark insights as read if the user has completed the suggested actions
    const insightsToMarkComplete = [];
    
    if (completedActions.has('profile_visited') || completedActions.has('profile_updated')) {
      insightsToMarkComplete.push('profile_setup', 'profile_enhancement');
    }
    
    if (completedActions.has('card_visited')) {
      insightsToMarkComplete.push('card_preview');
    }
    
    if (insightsToMarkComplete.length > 0) {
      await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('user_id', userId)
        .in('insight_type', insightsToMarkComplete)
        .eq('is_read', false);
    }
  } catch (error) {
    console.error('Error checking and removing completed insights:', error);
  }
}
