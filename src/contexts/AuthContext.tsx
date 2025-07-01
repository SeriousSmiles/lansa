import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  updateDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateDisplayName = (name: string) => {
    if (user) {
      setUser({ ...user, displayName: name });
    }
  };

  const fetchUserProfile = async (userId: string) => {
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
  };

  // Handle auth state changes - CRITICAL: Keep this synchronous to prevent deadlocks
  const handleAuthStateChange = (session: Session | null) => {
    console.log('Auth state changed:', session ? 'logged in' : 'logged out');
    setSession(session);
    
    if (session?.user) {
      // Set basic user info immediately
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.email?.split('@')[0] || 'Lansa User'
      });
      
      // Defer profile fetching to avoid blocking auth state updates
      setTimeout(() => {
        fetchUserProfile(session.user.id).then(displayName => {
          if (displayName) {
            setUser(prev => prev ? { ...prev, displayName } : null);
          }
        });
      }, 0);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Set up auth state listener FIRST (critical for preventing issues)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    return () => {
      console.log('Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    signIn: async (email: string, password: string) => {
      try {
        console.log('Attempting sign in...');
        const result = await supabase.auth.signInWithPassword({ email, password });
        
        if (result.error) {
          console.error('Sign in error:', result.error);
          return { error: result.error };
        }
        
        console.log('Sign in successful');
        return { error: null };
      } catch (error) {
        console.error("Error signing in:", error);
        toast.error("Failed to sign in. Please check your internet connection.");
        return { error };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const redirectUrl = `${window.location.origin}/`;
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
    },
    signOut: async () => {
      try {
        return await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
        return { error };
      }
    },
    updateDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
