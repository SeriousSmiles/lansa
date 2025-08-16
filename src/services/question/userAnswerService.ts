import { supabase } from "@/integrations/supabase/client";
import { UserAnswers } from "./types";

export async function saveUserAnswers(userId: string, answers: UserAnswers) {
  try {
    console.log("Saving user answers:", userId, answers);
    
    // First check if the user exists in the auth.users table
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser?.user) {
      console.error("User authentication error:", authError);
      return { success: false, error: authError };
    }
    
    // Check if the user already has answers
    const { data: existingAnswers, error: fetchError } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching existing answers:", fetchError);
      return { success: false, error: fetchError };
    }
    
    let result;
    
    // If user already has answers, update them
    if (existingAnswers) {
      console.log("Updating existing answers for user:", userId);
      const { error } = await supabase
        .from('user_answers')
        .update({ 
          gender: answers.gender ?? existingAnswers.gender,
          age_group: answers.age_group ?? existingAnswers.age_group,
          identity: answers.identity ?? existingAnswers.identity,
          desired_outcome: answers.desired_outcome ?? existingAnswers.desired_outcome,
          career_path: answers.career_path ?? existingAnswers.career_path,
          career_path_onboarding_completed: answers.career_path_onboarding_completed !== undefined ? answers.career_path_onboarding_completed : existingAnswers.career_path_onboarding_completed,
          onboarding_inputs: answers.onboarding_inputs ?? existingAnswers.onboarding_inputs,
          ai_onboarding_card: answers.ai_onboarding_card ?? existingAnswers.ai_onboarding_card,
          user_type: answers.user_type ?? existingAnswers.user_type,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating answers:", error);
        return { success: false, error };
      }
      result = { success: true };
    } else {
      // Otherwise, insert new answers
      console.log("Inserting new answers for user:", userId);
      const { error } = await supabase
        .from('user_answers')
        .insert([{ 
          user_id: userId, 
          gender: answers.gender,
          age_group: answers.age_group,
          identity: answers.identity,
          desired_outcome: answers.desired_outcome,
          career_path: answers.career_path,
          career_path_onboarding_completed: answers.career_path_onboarding_completed,
          onboarding_inputs: answers.onboarding_inputs || {},
          ai_onboarding_card: answers.ai_onboarding_card || null,
          user_type: answers.user_type
        }]);
      
      if (error) {
        console.error("Error inserting answers:", error);
        return { success: false, error };
      }
      result = { success: true };
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
      console.error("Error updating user profile:", profileError);
      // Don't prevent the flow if profile update fails
    }
    
    return result;
  } catch (error) {
    console.error('Error saving user answers:', error);
    return { success: false, error };
  }
}

export async function getUserAnswers(userId: string): Promise<UserAnswers | null> {
  try {
    console.log("Fetching user answers for:", userId);
    const { data, error } = await supabase
      .from('user_answers')
      .select('gender, age_group, identity, desired_outcome, career_path, career_path_onboarding_completed, onboarding_inputs, ai_onboarding_card, user_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching answers:", error);
      throw error;
    }
    
    // If no data or empty array, return null
    if (!data || data.length === 0) {
      console.log("No answers found for user:", userId);
      return null;
    }
    
    console.log("Found answers for user:", userId, data[0]);
    // Return the most recent answer
    return data[0] as UserAnswers;
  } catch (error) {
    console.error('Error fetching user answers:', error);
    throw error;
  }
}
