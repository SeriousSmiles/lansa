import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
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
  refreshUserState?: () => Promise<void>;
  isRefreshing?: boolean;
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
    verified: false,
    isRefreshing: false
  });

  // Debounce timer for refresh
  const [refreshDebounceTimer, setRefreshDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to fetch user state from database
  const fetchUserState = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setState(s => ({ 
          ...s, 
          loading: false, 
          isAuthenticated: false,
          isRefreshing: false 
        }));
        return { success: false };
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
          .select("user_type, career_path, career_path_onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle()
      ]);

      // Check for Lansa certification
      const { data: certData } = await supabase
        .from("user_certifications")
        .select("lansa_certified, verified")
        .eq("user_id", userId)
        .maybeSingle();

      // BACKWARD COMPATIBILITY: Consider onboarding complete if EITHER flag is true
      // CRITICAL: Also require user_type to be set to prevent incomplete onboarding
      const newOnboardingComplete = !!profileResult.data?.onboarding_completed;
      const oldOnboardingComplete = !!answersResult.data?.career_path_onboarding_completed;
      const hasUserType = !!answersResult.data?.user_type;
      const hasCompletedOnboarding = (newOnboardingComplete || oldOnboardingComplete) && hasUserType;

      // Auto-migrate if old flag is true but new flag is false
      if (oldOnboardingComplete && !newOnboardingComplete) {
        console.log("Auto-migrating onboarding status for user:", userId);
        supabase
          .from("user_profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error) console.error("Failed to auto-migrate:", error);
          });
      }

      setState({
        loading: false,
        isAuthenticated: true,
        userId,
        userType: answersResult.data?.user_type as 'job_seeker' | 'employer' | undefined,
        careerPath: answersResult.data?.career_path as CareerPath | undefined,
        hasCompletedOnboarding,
        lansaCertified: !!certData?.lansa_certified,
        verified: !!certData?.verified,
        isRefreshing: false
      });

      return { success: true };
    } catch (error) {
      console.error("Error loading user state:", error);
      setState(s => ({ 
        ...s, 
        loading: false,
        isRefreshing: false 
      }));
      return { success: false };
    }
  }, []);

  // Debounced refresh function exposed to consumers
  const refreshUserState = useCallback(async () => {
    // Clear any existing debounce timer
    if (refreshDebounceTimer) {
      clearTimeout(refreshDebounceTimer);
    }

    setState(s => ({ ...s, isRefreshing: true }));

    // Debounce to prevent excessive DB calls (300ms)
    const timer = setTimeout(async () => {
      console.log("🔄 Refreshing user state...");
      await fetchUserState();
    }, 300);

    setRefreshDebounceTimer(timer);
  }, [refreshDebounceTimer, fetchUserState]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) {
        await fetchUserState();
      }
    })();

    return () => {
      mounted = false;
      if (refreshDebounceTimer) {
        clearTimeout(refreshDebounceTimer);
      }
    };
  }, [fetchUserState]);

  const value = useMemo(() => ({
    ...state,
    refreshUserState,
  }), [state, refreshUserState]);
  
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserState() {
  return useContext(UserStateContext);
}
