import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CareerPath = "student" | "job_seeker" | "freelancer" | "entrepreneur" | "visionary" | "business";

type UserState = {
  loading: boolean;
  userId?: string;
  isAuthenticated: boolean;
  userType?: 'job_seeker' | 'employer';
  careerPath?: CareerPath;
  hasCompletedOnboarding: boolean;
  lansaCertified: boolean;
  verified: boolean;
};

const UserStateContext = createContext<UserState>({ 
  loading: true, 
  isAuthenticated: false, 
  hasCompletedOnboarding: false, 
  lansaCertified: false, 
  verified: false 
});

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>({ 
    loading: true, 
    isAuthenticated: false, 
    hasCompletedOnboarding: false, 
    lansaCertified: false, 
    verified: false 
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setState(s => ({ ...s, loading: false, isAuthenticated: false }));
          }
          return;
        }

        const userId = session.user.id;

        // Fetch both profile and user_answers for complete state
        const [profileResult, answersResult] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("user_answers")
            .select("user_type, career_path")
            .eq("user_id", userId)
            .maybeSingle()
        ]);

        // Check for Lansa certification
        const { data: certData } = await supabase
          .from("user_certifications")
          .select("lansa_certified, verified")
          .eq("user_id", userId)
          .maybeSingle();

        if (mounted) {
          setState({
            loading: false,
            isAuthenticated: true,
            userId,
            userType: answersResult.data?.user_type as 'job_seeker' | 'employer' | undefined,
            careerPath: answersResult.data?.career_path as CareerPath | undefined,
            hasCompletedOnboarding: !!profileResult.data?.onboarding_completed,
            lansaCertified: !!certData?.lansa_certified,
            verified: !!certData?.verified,
          });
        }
      } catch (error) {
        console.error("Error loading user state:", error);
        if (mounted) {
          setState(s => ({ ...s, loading: false }));
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserState() {
  return useContext(UserStateContext);
}
