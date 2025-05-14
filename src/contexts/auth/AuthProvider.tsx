
import { useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./AuthContext";
import { UserType } from "./types";
import { fetchUserProfile } from "./useProfileManagement";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserType>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const updateDisplayName = (name: string) => {
    if (user) {
      setUser({ ...user, displayName: name });
    }
  };

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // First set up the auth state listener to prevent missing events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed, event:", event);
            
            if (mounted) {
              setSession(currentSession);
              
              if (currentSession?.user) {
                const userId = currentSession.user.id;
                console.log("Auth state change with user:", userId);
                
                // Only fetch profile if we need to
                let displayName = user?.displayName;
                if (!displayName || displayName === currentSession.user.email?.split('@')[0]) {
                  displayName = await fetchUserProfile(userId);
                }
                
                setUser({
                  id: userId,
                  email: currentSession.user.email,
                  displayName: displayName || currentSession.user.email?.split('@')[0] || 'Lansa User'
                });
              } else {
                console.log("Auth state change with no user");
                setUser(null);
              }
            }
          }
        );
        
        // Then check for existing session
        const { data: initialSession } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession.session);
          
          // If we have a user, load their profile
          if (initialSession.session?.user) {
            const userId = initialSession.session.user.id;
            const displayName = await fetchUserProfile(userId);
            
            setUser({
              id: userId,
              email: initialSession.session.user.email,
              displayName: displayName || initialSession.session.user.email?.split('@')[0] || 'Lansa User'
            });
            
            console.log("Auth initialized with user:", userId);
          } else {
            console.log("Auth initialized with no user");
          }
          
          setLoading(false);
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    }
    
    // Start auth initialization
    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    user,
    session,
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          console.error("Sign in error:", error);
          return { error };
        }
        
        console.log("Sign in successful, session:", data.session ? "exists" : "null");
        return { error: null };
      } catch (error) {
        console.error("Error signing in:", error);
        toast.error("Failed to sign in. Please check your internet connection.");
        return { error };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const result = await supabase.auth.signUp({ email, password });
        return result;
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
      {authInitialized && children}
    </AuthContext.Provider>
  );
}
