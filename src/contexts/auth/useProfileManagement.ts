
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserProfile(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profile?.name) {
      return profile.name;
    }
    
    // Check localStorage as fallback for new users
    const localName = localStorage.getItem('userName');
    if (localName) {
      // Update profile with name from localStorage if it exists
      await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: userId,
          name: localName
        });
      
      // Clear localStorage after use
      localStorage.removeItem('userName');
      return localName;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
