
import { Session } from "@supabase/supabase-js";

export type UserType = {
  id: string;
  email?: string;
  displayName?: string;
} | null;

export interface AuthContextType {
  user: UserType;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  updateDisplayName: (name: string) => void;
}
