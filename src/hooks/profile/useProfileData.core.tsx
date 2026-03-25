
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../useProfileData";
import { trackUserAction } from "@/services/actionTracking";

interface UseProfileDataCoreProps {
  userId: string | undefined;
}

export function useProfileDataCore({ userId }: UseProfileDataCoreProps) {
  // Update or create profile data function
  const updateProfileData = async (updatedData: Partial<UserProfile>) => {
    if (!userId) return;
    
    try {
      // Prepare data for Supabase by converting typed objects to raw JSON
      const supabaseData: any = { ...updatedData };
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update(supabaseData)
          .eq('user_id', userId);
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert({ user_id: userId, ...supabaseData });
      }
      
      if (result.error) throw result.error;
      
      return result;
    } catch (error) {
      console.error("Error updating profile data:", error);
      throw error;
    }
  };

  // Function to update user answers in the database
  const updateUserAnswer = async (field: string, value: string) => {
    if (!userId) return;

    try {
      const { data: existingAnswer, error: fetchError } = await supabase
        .from('user_answers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingAnswer) {
        // Update existing answer
        result = await supabase
          .from('user_answers')
          .update({ [field]: value })
          .eq('user_id', userId);
      } else {
        // Create new answer
        result = await supabase
          .from('user_answers')
          .insert({ user_id: userId, [field]: value });
      }
      
      if (result.error) {
        console.error('Error updating answer:', result.error);
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating answer:', error);
      throw error;
    }
  };

  return {
    updateProfileData,
    updateUserAnswer
  };
}
