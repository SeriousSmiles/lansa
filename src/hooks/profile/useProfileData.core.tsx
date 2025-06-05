
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../useProfileData";

interface UseProfileDataCoreProps {
  userId: string | undefined;
}

export function useProfileDataCore({ userId }: UseProfileDataCoreProps) {
  // Update or create profile data function
  const updateProfileData = async (updatedData: Partial<UserProfile>) => {
    if (!userId) {
      console.error("Cannot update profile: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Starting profile update for user:", userId);
      console.log("📝 Data to update:", updatedData);
      
      // Prepare data for Supabase by converting typed objects to raw JSON
      const supabaseData: any = { ...updatedData };
      
      // Check if profile exists
      console.log("🔍 Checking if profile exists...");
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("❌ Error checking existing profile:", fetchError);
        throw fetchError;
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        console.log("📝 Updating existing profile...");
        result = await supabase
          .from('user_profiles')
          .update(supabaseData)
          .eq('user_id', userId);
      } else {
        // Create new profile
        console.log("🆕 Creating new profile...");
        result = await supabase
          .from('user_profiles')
          .insert({ user_id: userId, ...supabaseData });
      }
      
      if (result.error) {
        console.error("❌ Database operation failed:", result.error);
        console.error("❌ Error details:", {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        throw result.error;
      }
      
      console.log("✅ Profile data updated successfully");
      console.log("📊 Update result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error updating profile data:", error);
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));
      throw error;
    }
  };

  // Function to update user answers in the database
  const updateUserAnswer = async (field: string, value: string) => {
    if (!userId) {
      console.error("Cannot update user answer: userId is undefined");
      return;
    }

    try {
      console.log("🔄 Starting user answer update for field:", field, "with value:", value);
      
      const { data: existingAnswer, error: fetchError } = await supabase
        .from('user_answers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("❌ Error checking existing answer:", fetchError);
        throw fetchError;
      }
      
      let result;
      
      if (existingAnswer) {
        // Update existing answer
        console.log("📝 Updating existing user answer...");
        result = await supabase
          .from('user_answers')
          .update({ [field]: value })
          .eq('user_id', userId);
      } else {
        // Create new answer
        console.log("🆕 Creating new user answer...");
        result = await supabase
          .from('user_answers')
          .insert({ user_id: userId, [field]: value });
      }
      
      if (result.error) {
        console.error('❌ Error updating answer:', result.error);
        console.error("❌ Answer update error details:", {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        throw new Error('Failed to update profile');
      }
      
      console.log("✅ User answer updated successfully");
      console.log("📊 Answer update result:", result);
    } catch (error) {
      console.error('❌ Error updating answer:', error);
      console.error("❌ Full answer error object:", JSON.stringify(error, null, 2));
      throw error;
    }
  };

  return {
    updateProfileData,
    updateUserAnswer
  };
}
