
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

// Initialize Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Create the Supabase client with proper error handling
const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

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
    // Get session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
