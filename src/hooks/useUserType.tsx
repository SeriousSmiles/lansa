import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserType = 'job_seeker' | 'employer' | null;

export function useUserType() {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserType() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: userAnswers, error } = await supabase
          .from('user_answers')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user type:', error);
          setUserType('job_seeker'); // Default fallback
        } else {
          setUserType((userAnswers?.user_type as UserType) || 'job_seeker');
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
        setUserType('job_seeker'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserType();
  }, [user?.id]);

  return { userType, isLoading };
}