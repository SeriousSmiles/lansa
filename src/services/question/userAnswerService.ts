import { supabase } from "@/integrations/supabase/client";
import { UserAnswers } from "./types";
import { logUserAction, error as logError } from "@/utils/logger";

export async function saveUserAnswers(userId: string, answers: UserAnswers) {
  try {
    logUserAction("save_user_answers");
    
    // First check if the user exists in the auth.users table
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser?.user) {
      logError("User authentication error");
      return { success: false, error: authError };
    }
    
    // Use upsert for simplicity - it handles both insert and update
    const { error } = await supabase
      .from('user_answers')
      .upsert({ 
        user_id: userId, 
        gender: answers.gender,
        age_group: answers.age_group,
        identity: answers.identity,
        desired_outcome: answers.desired_outcome,
        career_path: answers.career_path,
        career_path_onboarding_completed: answers.career_path_onboarding_completed,
        onboarding_inputs: answers.onboarding_inputs || {},
        ai_onboarding_card: answers.ai_onboarding_card || null,
        user_type: answers.user_type,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      logError("Error upserting answers");
      return { success: false, error };
    }
    
    // Also update the user profile with the same information
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .update({ 
            gender: answers.gender || existingProfile.gender,
            age_group: answers.age_group || existingProfile.age_group,
            identity: answers.identity || existingProfile.identity,
            desired_outcome: answers.desired_outcome || existingProfile.desired_outcome,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_profiles')
          .insert([{ 
            user_id: userId, 
            gender: answers.gender,
            age_group: answers.age_group,
            identity: answers.identity,
            desired_outcome: answers.desired_outcome
          }]);
      }
    } catch (profileError: any) {
      logError("Error updating user profile");
      // Don't prevent the flow if profile update fails
    }
    
    return { success: true };
  } catch (error) {
    logError('Error saving user answers');
    return { success: false, error };
  }
}

export async function getUserAnswers(userId: string): Promise<UserAnswers | null> {
  try {
    const { data, error } = await supabase
      .from('user_answers')
      .select('gender, age_group, identity, desired_outcome, career_path, career_path_onboarding_completed, onboarding_inputs, ai_onboarding_card, user_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      logError("Error fetching answers");
      throw error;
    }
    
    // If no data or empty array, return null
    if (!data || data.length === 0) {
      return null;
    }
    // Return the most recent answer
    return data[0] as UserAnswers;
  } catch (error) {
    logError('Error fetching user answers');
    throw error;
  }
}
