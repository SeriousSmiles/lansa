
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal, UserAnswers } from "@/services/question";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import { v4 as uuidv4 } from "@/utils/uuid";
import { convertJsonToExperienceItems, convertJsonToEducationItems } from "@/utils/profileDataConverters";

export function useProfileLoader(userId: string | undefined) {
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadAnswers = async () => {
    if (!userId) return null;
    
    const answers = await getUserAnswers(userId);
    setUserAnswers(answers);
    return answers;
  };
  
  const fetchProfileData = async () => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }
    
    return data;
  };
  
  return {
    userAnswers,
    setUserAnswers,
    isLoading,
    setIsLoading,
    loadAnswers,
    fetchProfileData
  };
}
