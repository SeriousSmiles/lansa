import * as React from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

type CareerPath = "student" | "job_seeker" | "freelancer" | "entrepreneur" | "visionary" | "business";

type UserInfo = {
  id: string;
  email?: string;
  displayName?: string;
} | null;

interface UnifiedAuthState {
  // Auth
  user: UserInfo;
  session: Session | null;
  loading: boolean;          // True only until initial load completes
  isRefreshing: boolean;     // True during background refreshes (tab focus, token refresh)

  // User data (loaded in single batch)
  userId?: string;
  isAuthenticated: boolean;
  userType?: 'job_seeker' | 'employer' | 'mentor';
  careerPath?: CareerPath;
  hasCompletedOnboarding: boolean;
  lansaCertified: boolean;
  verified: boolean;
  isAdmin: boolean;
  organizationId?: string;
  organizationRole?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  hasPendingOrgRequest?: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; full_name?: string }) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateDisplayName: (name: string) => void;
  refreshUserState: () => Promise<void>;
}

const UnifiedAuthContext = React.createContext<UnifiedAuthState | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────

export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<UserInfo>(null);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // User data state
  const [userType, setUserType] = React.useState<'job_seeker' | 'employer' | 'mentor' | undefined>();
  const [careerPath, setCareerPath] = React.useState<CareerPath | undefined>();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [lansaCertified, setLansaCertified] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [organizationId, setOrganizationId] = React.useState<string | undefined>();
  const [organizationRole, setOrganizationRole] = React.useState<any>();
  const [hasPendingOrgRequest, setHasPendingOrgRequest] = React.useState(false);

  // Refs
  const inFlightRef = React.useRef(false);
  const initializedRef = React.useRef(false);
  const previousUserTypeRef = React.useRef<'job_seeker' | 'employer' | 'mentor'>();

  // ─── Fetch all user data in one batch ────────────────────────────
  const fetchAllUserData = React.useCallback(async (userId: string) => {
    // Single batch: profile, answers, org membership, certification, admin role
    const [profileResult, answersResult, orgResult, certResult, adminResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("onboarding_completed, name")
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
        .maybeSingle(),
      supabase
        .from("user_certifications")
        .select("lansa_certified, verified")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle(),
    ]);

    // Onboarding: complete if EITHER flag is true AND user_type is set
    const newOnboardingComplete = !!profileResult.data?.onboarding_completed;
    const oldOnboardingComplete = !!answersResult.data?.career_path_onboarding_completed;
    const hasUserType = !!answersResult.data?.user_type;
    const onboardingComplete = (newOnboardingComplete || oldOnboardingComplete) && hasUserType;

    // Auto-migrate old flag
    if (oldOnboardingComplete && !newOnboardingComplete) {
      supabase
        .from("user_profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error("Failed to auto-migrate onboarding:", error);
        });
    }

    // Pending org requests (separate query, depends on nothing above)
    const { data: pendingRequests } = await supabase
      .from("organization_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", false)
      .maybeSingle();

    // Resolve userType with fallback to prevent race condition
    const currentUserType = answersResult.data?.user_type as 'job_seeker' | 'employer' | 'mentor' | undefined;
    const resolvedUserType = currentUserType || previousUserTypeRef.current;
    if (currentUserType) previousUserTypeRef.current = currentUserType;

    // Display name
    const displayName = profileResult.data?.name || undefined;

    return {
      userType: resolvedUserType,
      careerPath: answersResult.data?.career_path as CareerPath | undefined,
      hasCompletedOnboarding: onboardingComplete,
      lansaCertified: !!certResult.data?.lansa_certified,
      verified: !!certResult.data?.verified,
      isAdmin: !!adminResult.data && !adminResult.error,
      organizationId: orgResult.data?.organization_id,
      organizationRole: orgResult.data?.role,
      hasPendingOrgRequest: !!pendingRequests,
      displayName,
    };
  }, []);

  // ─── Main state loader ───────────────────────────────────────────
  const loadState = React.useCallback(async (isBackground = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        setSession(null);
        setUser(null);
        setUserType(undefined);
        setCareerPath(undefined);
        setHasCompletedOnboarding(false);
        setLansaCertified(false);
        setVerified(false);
        setIsAdmin(false);
        setOrganizationId(undefined);
        setOrganizationRole(undefined);
        setHasPendingOrgRequest(false);
        return;
      }

      setSession(currentSession);
      const userId = currentSession.user.id;

      // Set basic user info immediately (email-based display name as fallback)
      setUser(prev => ({
        id: userId,
        email: currentSession.user.email,
        displayName: prev?.displayName || currentSession.user.email?.split('@')[0] || 'Lansa User',
      }));

      // Fetch all data in one batch
      const data = await fetchAllUserData(userId);

      // Update display name if we got one from DB
      if (data.displayName) {
        setUser(prev => prev ? { ...prev, displayName: data.displayName } : null);
      } else {
        // Check localStorage fallback for new users
        const localName = localStorage.getItem('userName');
        if (localName) {
          setUser(prev => prev ? { ...prev, displayName: localName } : null);
          supabase.from('user_profiles').upsert({ user_id: userId, name: localName }).then(() => {
            localStorage.removeItem('userName');
          });
        }
      }

      setUserType(data.userType);
      setCareerPath(data.careerPath);
      setHasCompletedOnboarding(data.hasCompletedOnboarding);
      setLansaCertified(data.lansaCertified);
      setVerified(data.verified);
      setIsAdmin(data.isAdmin);
      setOrganizationId(data.organizationId);
      setOrganizationRole(data.organizationRole);
      setHasPendingOrgRequest(data.hasPendingOrgRequest);

      initializedRef.current = true;
    } catch (error) {
      console.error("Error loading auth state:", error);
      setSession(null);
      setUser(null);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchAllUserData]);

  // ─── Refresh (exposed to consumers) ──────────────────────────────
  const refreshUserState = React.useCallback(async () => {
    setIsRefreshing(true);
    await loadState(true);
  }, [loadState]);

  // ─── Auth listener + initial load ────────────────────────────────
  React.useEffect(() => {
    let mounted = true;

    // Initial load
    loadState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setUserType(undefined);
        setCareerPath(undefined);
        setHasCompletedOnboarding(false);
        setLansaCertified(false);
        setVerified(false);
        setIsAdmin(false);
        setOrganizationId(undefined);
        setOrganizationRole(undefined);
        setHasPendingOrgRequest(false);
        setLoading(false);
        setIsRefreshing(false);
        previousUserTypeRef.current = undefined;
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!initializedRef.current) {
          setLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setTimeout(() => {
          if (mounted) loadState(initializedRef.current);
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadState]);

  // ─── Auth actions ────────────────────────────────────────────────
  const updateDisplayName = React.useCallback((name: string) => {
    setUser(prev => prev ? { ...prev, displayName: name } : null);
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      toast.error("Failed to sign in. Please check your internet connection.");
      return { error };
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, metadata?: { first_name?: string; last_name?: string; full_name?: string }) => {
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      return await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: metadata || {} },
      });
    } catch (error) {
      toast.error("Failed to sign up. Please check your internet connection.");
      return { error, data: null };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      ['supabase.auth.token', 'highlightRecommendedActions'].forEach(key => {
        try { localStorage.removeItem(key); } catch {}
      });
      if (session?.user?.app_metadata?.provider === 'google') {
        try { sessionStorage.clear(); } catch {}
      }
      const result = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return result;
    } catch (error) {
      return { error };
    }
  }, [session]);

  const resetPassword = React.useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password?mode=reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  const updatePassword = React.useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  // ─── Context value ───────────────────────────────────────────────
  const value = React.useMemo<UnifiedAuthState>(() => ({
    user,
    session,
    loading,
    isRefreshing,
    userId: user?.id,
    isAuthenticated: !!session,
    userType,
    careerPath,
    hasCompletedOnboarding,
    lansaCertified,
    verified,
    isAdmin,
    organizationId,
    organizationRole,
    hasPendingOrgRequest,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateDisplayName,
    refreshUserState,
  }), [
    user, session, loading, isRefreshing, userType, careerPath,
    hasCompletedOnboarding, lansaCertified, verified, isAdmin,
    organizationId, organizationRole, hasPendingOrgRequest,
    signIn, signUp, signOut, resetPassword, updatePassword,
    updateDisplayName, refreshUserState,
  ]);

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// ─── Hooks (backward-compatible) ─────────────────────────────────

/** Primary hook — full access to unified state */
export function useUnifiedAuth() {
  const ctx = React.useContext(UnifiedAuthContext);
  if (!ctx) throw new Error("useUnifiedAuth must be used within UnifiedAuthProvider");
  return ctx;
}

/** Backward-compatible: drop-in replacement for the old useAuth() */
export function useAuth() {
  const ctx = useUnifiedAuth();
  return {
    user: ctx.user,
    session: ctx.session,
    loading: ctx.loading,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
    resetPassword: ctx.resetPassword,
    updatePassword: ctx.updatePassword,
    updateDisplayName: ctx.updateDisplayName,
  };
}

/** Backward-compatible: drop-in replacement for the old useUserState() */
export function useUserState() {
  const ctx = useUnifiedAuth();
  return {
    loading: ctx.loading,
    userId: ctx.userId,
    isAuthenticated: ctx.isAuthenticated,
    userType: ctx.userType,
    careerPath: ctx.careerPath,
    hasCompletedOnboarding: ctx.hasCompletedOnboarding,
    lansaCertified: ctx.lansaCertified,
    verified: ctx.verified,
    organizationId: ctx.organizationId,
    organizationRole: ctx.organizationRole,
    hasPendingOrgRequest: ctx.hasPendingOrgRequest,
    refreshUserState: ctx.refreshUserState,
    isRefreshing: ctx.isRefreshing,
    isAdmin: ctx.isAdmin,
  };
}
