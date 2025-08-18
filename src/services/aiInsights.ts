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
    
    // Check for missing critical fields
    const missing = [];
    if (!profile.title) missing.push("job title");
    if (!profile.about_text) missing.push("professional summary");
    if (!profile.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) missing.push("skills");
    if (!profile.experiences || (Array.isArray(profile.experiences) && profile.experiences.length === 0)) missing.push("work experience");
    
    if (missing.length > 0) {
      return {
        id: `profile-completion-${Date.now()}`,
        title: "Enhance Your Profile",
        message: `Add your ${missing.join(", ")} to make your profile more compelling to potential matches.`,
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
    if (!userAnswers) return null;
    
    // Based on user's career path, suggest actions
    if (userAnswers.career_path === 'student') {
      return {
        id: `student-action-${Date.now()}`,
        title: "Build Your Network",
        message: "As a student, start connecting with professionals in your field. Consider joining industry groups and attending virtual events.",
        insight_type: "networking",
        priority: 3,
        navigation_target: "/opportunity-discovery",
        is_read: false,
        created_at: new Date().toISOString()
      };
    }
    
    if (userAnswers.career_path === 'entrepreneur') {
      return {
        id: `entrepreneur-action-${Date.now()}`,
        title: "Showcase Your Ventures",
        message: "Highlight your entrepreneurial projects and the impact you've created. This sets you apart from traditional candidates.",
        insight_type: "profile_optimization",
        priority: 2,
        navigation_target: "/profile",
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

// Note: These functions are temporarily mocked since ai_insights table doesn't exist
export async function getUserInsights(userId: string): Promise<AIInsight[]> {
  try {
    // Generate insights dynamically instead of fetching from database
    return await generateInsights(userId);
  } catch (error) {
    console.error('Error getting user insights:', error);
    return [];
  }
}

export async function markInsightAsRead(insightId: string): Promise<void> {
  // Mock implementation - in a real app this would update the database
  console.log('Insight marked as read:', insightId);
}

export async function dismissInsight(insightId: string): Promise<void> {
  // Mock implementation - in a real app this would update the database
  console.log('Insight dismissed:', insightId);
}

// Generate personalized insight for a user
export async function getPersonalizedInsight(userId: string) {
  try {
    const userAnswers = await getUserAnswers(userId);
    
    if (!userAnswers) {
      console.log('No user answers found for:', userId);
      return null;
    }

    console.log('User answers:', userAnswers);

    // Check if we already have a stored insight
    console.log('No stored insight found, generating new insight');
    
    // Generate AI insight for user
    console.log('Generating AI insight for user:', userId);
    
    const data = {
      user_id: userId,
      identity: userAnswers.identity,
      desired_outcome: userAnswers.desired_outcome,
      career_path: userAnswers.career_path,
      gender: userAnswers.gender,
      age_group: userAnswers.age_group
    };
    
    console.log('Using data:', data);
    
    // Call edge function to generate insight
    const { data: response, error } = await supabase.functions.invoke('generate-insight', {
      body: data
    });
    
    if (error) {
      console.error('Error calling generate-insight function:', error);
      return null;
    }
    
    console.log('AI insight generated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error generating personalized insight:', error);
    return null;
  }
}

// Mock functions for backward compatibility
export async function saveInsightsToDatabase(insights: AIInsight[]): Promise<void> {
  // Mock implementation - in a real app this would save to database
  console.log('Insights would be saved to database:', insights.length);
}

export async function checkAndRemoveCompletedInsights(userId: string): Promise<void> {
  // Mock implementation - in a real app this would clean up completed insights
  console.log('Checking and removing completed insights for user:', userId);
}