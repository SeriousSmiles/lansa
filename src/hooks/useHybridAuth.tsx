import { useAuth } from '@/contexts/AuthContext';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';

// Hook that provides unified auth interface for both Supabase and Clerk
export function useHybridAuth() {
  const isClerkEnabled = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const supabaseAuth = useAuth();
  
  let clerkAuth;
  try {
    clerkAuth = useClerkAuth();
  } catch (error) {
    // Clerk context not available
    clerkAuth = null;
  }

  if (isClerkEnabled && clerkAuth) {
    return {
      user: clerkAuth.user ? {
        id: clerkAuth.user.id,
        email: clerkAuth.user.primaryEmailAddress?.emailAddress,
        displayName: clerkAuth.user.fullName || clerkAuth.user.firstName
      } : null,
      loading: !clerkAuth.isLoaded || clerkAuth.isLoading,
      isSignedIn: clerkAuth.isSignedIn,
      organization: clerkAuth.organization,
      organizations: clerkAuth.organizations,
      switchOrganization: clerkAuth.switchOrganization,
      createOrganization: clerkAuth.createOrganization,
      inviteUserToOrganization: clerkAuth.inviteUserToOrganization,
      authType: 'clerk' as const
    };
  }

  return {
    user: supabaseAuth.user,
    loading: supabaseAuth.loading,
    isSignedIn: !!supabaseAuth.user,
    organization: null,
    organizations: [],
    switchOrganization: async () => {},
    createOrganization: async () => {},
    inviteUserToOrganization: async () => {},
    authType: 'supabase' as const
  };
}