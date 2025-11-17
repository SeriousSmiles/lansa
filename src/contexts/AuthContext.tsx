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
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; full_name?: string }) => Promise<{ error: any; data: any }>;
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
      // Reduce console noise for demo
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user profile:', error);
      }
      return null;
    }
  }, []);

  // Simplified auth state handler - keep it synchronous and minimal
  const handleAuthStateChange = React.useCallback((session: Session | null) => {
    setSession(session);
    
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.email?.split('@')[0] || 'Lansa User'
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
    }
    
    setLoading(false);
  }, [fetchUserProfile]);

  React.useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(session);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing in:", error);
      }
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
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {}
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing up:", error);
      }
      toast.error("Failed to sign up. Please check your internet connection.");
      return { error, data: null };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      // Clear sensitive localStorage items
      const keysToRemove = ['supabase.auth.token', 'highlightRecommendedActions'];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore localStorage errors
        }
      });

      // Clear any Google OAuth session data
      if (session?.user?.app_metadata?.provider === 'google') {
        // Additional cleanup for Google OAuth
        try {
          sessionStorage.clear();
        } catch (e) {
          // Ignore sessionStorage errors
        }
      }

      const result = await supabase.auth.signOut();
      
      // Force clear user state immediately
      setUser(null);
      setSession(null);
      
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing out:", error);
      }
      return { error };
    }
  }, [session]);

  const resetPassword = React.useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password?mode=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      return { error };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error resetting password:", error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating password:", error);
      }
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