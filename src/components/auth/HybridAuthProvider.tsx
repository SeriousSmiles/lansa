import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext';

// Hybrid provider that supports both Supabase and Clerk auth during migration
export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const isClerkEnabled = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (isClerkEnabled) {
    return (
      <ClerkAuthProvider>
        {children}
      </ClerkAuthProvider>
    );
  }
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}