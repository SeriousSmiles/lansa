import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
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

  // Ref to prevent overlapping fetches
  const inFlightRef = useRef(false);

  // Function to fetch user state from database
  const fetchUserState = useCallback(async () => {
    // Prevent overlapping fetches
    if (inFlightRef.current) {
      console.log("⏭️ Skipping fetch - already in flight");
      return;
    }

    inFlightRef.current = true;
    console.log("📊 Fetching user state...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ No session found");
        setState({ 
          loading: false, 
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          lansaCertified: false,
          verified: false,
          isRefreshing: false 
        });
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

      console.log("✅ User state loaded:", {
        userId,
        userType: answersResult.data?.user_type,
        hasCompletedOnboarding
      });

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
      setState({ 
        loading: false,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        lansaCertified: false,
        verified: false,
        isRefreshing: false 
      });
      return { success: false };
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  // Debounced refresh function exposed to consumers
  const refreshUserState = useCallback(async () => {
    setState(s => ({ ...s, isRefreshing: true }));
    console.log("🔄 Refreshing user state...");
    await fetchUserState();
  }, [fetchUserState]);

  // Initial load and auth state listener
  useEffect(() => {
    let mounted = true;

    // Initial fetch
    (async () => {
      if (mounted) {
        await fetchUserState();
      }
    })();

    // Listen to auth state changes (non-async to prevent cascading issues)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("🔐 Auth state change:", event);

      if (event === 'SIGNED_OUT') {
        // Immediately clear state on logout (synchronous)
        console.log("🚪 User signed out - clearing state");
        setState({ 
          loading: false, 
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          lansaCertified: false,
          verified: false,
          isRefreshing: false 
        });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Set loading and defer fetch to avoid blocking auth callback
        console.log("🔄 Refetching user state due to auth change");
        setState(s => ({ ...s, loading: true }));
        // Defer to next tick to let auth state settle
        setTimeout(() => {
          if (mounted) {
            fetchUserState();
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
