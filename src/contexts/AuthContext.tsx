import * as React from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type UserType = {
  id: string;
  email?: string;
  displayName?: string;
} | null;

interface AuthContextType {
  user: UserType;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateDisplayName: (name: string) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserType>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  const updateDisplayName = React.useCallback((name: string) => {
    if (user) {
      setUser({ ...user, displayName: name });
    }
  }, [user]);

  const fetchUserProfile = React.useCallback(async (userId: string) => {
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
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = React.useCallback((session: Session | null) => {
    console.log("AuthContext: Auth state changed", { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      currentUrl: window.location.href 
    });
    
    setSession(session);
    
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.email?.split('@')[0] || 'Lansa User'
      });
      
      console.log("AuthContext: User set", { 
        userId: session.user.id, 
        email: session.user.email 
      });
      
      // Fetch user profile data asynchronously after state update
      setTimeout(() => {
        fetchUserProfile(session.user.id).then((displayName) => {
          if (displayName) {
            setUser(prev => prev ? { ...prev, displayName } : null);
          }
        });
      }, 0);
    } else {
      setUser(null);
      console.log("AuthContext: User cleared");
    }
    
    setLoading(false);
  }, [fetchUserProfile]);

  React.useEffect(() => {
    // Clean up any stale auth state before initializing
    const cleanupStorage = () => {
      try {
        // Clear any potentially corrupted session data
        const currentSession = localStorage.getItem('sb-hrmklkcdxkeyttboosgr-auth-token');
        if (currentSession && !JSON.parse(currentSession)?.access_token) {
          localStorage.removeItem('sb-hrmklkcdxkeyttboosgr-auth-token');
        }
      } catch (e) {
        // Ignore JSON parse errors
        localStorage.removeItem('sb-hrmklkcdxkeyttboosgr-auth-token');
      }
    };
    
    cleanupStorage();

    // Set up auth state listener FIRST (critical for preventing double login issue)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    try {
      // Clear existing session data before signing in to prevent conflicts
      localStorage.removeItem('sb-hrmklkcdxkeyttboosgr-auth-token');
      
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      // If login is successful but we're still waiting for the auth state to update
      // ensure we don't show an error
      if (!result.error && result.data?.session) {
        return { error: null };
      }
      
      return result;
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in. Please check your internet connection.");
      return { error };
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      return await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Failed to sign up. Please check your internet connection.");
      return { error, data: null };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    }
  }, []);

  const resetPassword = React.useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?mode=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error };
    }
  }, []);

  const updatePassword = React.useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      return { error };
    } catch (error) {
      console.error("Error updating password:", error);
      return { error };
    }
  }, []);

  const value = React.useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateDisplayName,
  }), [user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword, updateDisplayName]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}