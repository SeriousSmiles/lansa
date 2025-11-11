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
  organizationId?: string;
  organizationRole?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  hasPendingOrgRequest?: boolean;
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
  // Ref to track if we've completed initial load
  const initializedRef = useRef(false);
  // CRITICAL: Preserve userType during refresh to prevent race condition
  const previousUserTypeRef = useRef<'job_seeker' | 'employer'>();

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

      // Fetch profile, user_answers, and organization membership for complete state
      const [profileResult, answersResult, orgMembershipResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_answers")
          .select("user_type, career_path, career_path_onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("organization_memberships")
          .select("organization_id, role, is_active")
          .eq("user_id", userId)
          .eq("is_active", true)
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
      let newOnboardingComplete = !!profileResult.data?.onboarding_completed;
      const oldOnboardingComplete = !!answersResult.data?.career_path_onboarding_completed;
      const hasUserType = !!answersResult.data?.user_type;
      
      // AUTO-RECOVERY: Fix users stuck in onboarding limbo
      // If user has user_type but no onboarding flags, auto-complete their onboarding
      if (hasUserType && !newOnboardingComplete && !oldOnboardingComplete) {
        console.log("🔧 [UserStateProvider] Auto-recovering stuck user:", userId);
        
        try {
          const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
          await markOnboardingComplete(userId, answersResult.data.user_type as 'job_seeker' | 'employer');
          
          console.log("✅ [UserStateProvider] Auto-recovery successful for user:", userId);
          
          // Update local flag so we consider them complete
          newOnboardingComplete = true;
        } catch (recoveryError) {
          console.error("❌ [UserStateProvider] Auto-recovery failed:", recoveryError);
          // Don't block user flow - they can still use the app
        }
      } else if (oldOnboardingComplete && !newOnboardingComplete) {
        // Legacy migration: old flag is true but new flag is false
        console.log("🔄 [UserStateProvider] Migrating legacy onboarding flag for user:", userId);
        supabase
          .from("user_profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error) console.error("Failed to migrate:", error);
          });
      }
      
      const hasCompletedOnboarding = (newOnboardingComplete || oldOnboardingComplete) && hasUserType;

      // Check for pending org requests
      const { data: pendingRequests } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", false)
        .maybeSingle();

      console.log("✅ User state loaded:", {
        userId,
        userType: answersResult.data?.user_type,
        hasCompletedOnboarding,
        hasOrgMembership: !!orgMembershipResult.data,
        hasPendingOrgRequest: !!pendingRequests
      });

      // CRITICAL: Use previous userType as fallback during refresh to prevent race condition
      const currentUserType = answersResult.data?.user_type as 'job_seeker' | 'employer' | undefined;
      const finalUserType = currentUserType || previousUserTypeRef.current;
      
      setState({
        loading: false,
        isAuthenticated: true,
        userId,
        userType: finalUserType,
        careerPath: answersResult.data?.career_path as CareerPath | undefined,
        hasCompletedOnboarding,
        lansaCertified: !!certData?.lansa_certified,
        verified: !!certData?.verified,
        organizationId: orgMembershipResult.data?.organization_id,
        organizationRole: orgMembershipResult.data?.role as any,
        hasPendingOrgRequest: !!pendingRequests,
        isRefreshing: false
      });
      
      // Update ref for next refresh
      if (currentUserType) {
        previousUserTypeRef.current = currentUserType;
      }

      // Mark as initialized after first successful fetch
      initializedRef.current = true;

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
        // CRITICAL: Differentiate between initial login and background refresh
        console.log("🔄 Refetching user state due to auth change");
        
        if (!initializedRef.current) {
          // Initial login - show loading screen
          setState(s => ({ ...s, loading: true }));
        } else {
          // Background refresh (tab focus) - don't show loading screen
          setState(s => ({ ...s, isRefreshing: true }));
        }
        
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

  // Expose refreshUserState globally for OrganizationContext
  useEffect(() => {
    (window as any).__userStateRefresh = refreshUserState;
    return () => {
      delete (window as any).__userStateRefresh;
    };
  }, [refreshUserState]);

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
