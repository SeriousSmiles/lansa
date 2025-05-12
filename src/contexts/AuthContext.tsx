
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type UserType = {
  id: string;
  email?: string;
} | null;

interface AuthContextType {
  user: UserType;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    signIn: async (email: string, password: string) => {
      try {
        return await supabase.auth.signInWithPassword({ email, password });
      } catch (error) {
        console.error("Error signing in:", error);
        toast.error("Failed to sign in. Please check your internet connection.");
        return { error };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        // We don't use metadata here anymore as we're saving to user_profiles table
        return await supabase.auth.signUp({ email, password });
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
