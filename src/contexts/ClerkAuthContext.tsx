import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ClerkProvider, 
  useAuth as useClerkAuthHook, 
  useUser as useClerkUser, 
  useOrganization, 
  useOrganizationList 
} from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

interface ClerkAuthContextType {
  user: any;
  organization: any;
  organizations: any[];
  isLoaded: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
  supabaseSession: any;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string, slug?: string) => Promise<void>;
  inviteUserToOrganization: (email: string, role?: string) => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

// Inner provider that uses Clerk hooks
function ClerkAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, userId } = useClerkAuthHook();
  const { user } = useClerkUser();
  const { organization, memberships } = useOrganization();
  const { userMemberships, setActive, createOrganization: clerkCreateOrganization } = useOrganizationList();
  
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseSession, setSupabaseSession] = useState(null);

  // Sync Clerk auth with Supabase
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!isLoaded) return;

      try {
        if (isSignedIn && userId) {
          // Get Clerk token and set it for Supabase
          const token = await getToken({ template: 'supabase' });
          
          if (token) {
            // Set the Supabase session with Clerk token
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: ''
            });
            
            if (error) {
              console.error('Error setting Supabase session:', error);
            } else {
              setSupabaseSession(data.session);
              await syncUserData();
            }
          }
        } else {
          // Sign out from Supabase when not signed in to Clerk
          await supabase.auth.signOut();
          setSupabaseSession(null);
        }
      } catch (error) {
        console.error('Error syncing with Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncWithSupabase();
  }, [isLoaded, isSignedIn, userId, getToken]);

  // Sync user data between Clerk and Supabase
  const syncUserData = async () => {
    if (!user) return;

    try {
      // Check if user exists in migration mapping
      const { data: migrationData } = await supabase
        .from('user_migration_mapping')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (!migrationData) {
        // Create new user profile for Clerk user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            clerk_user_id: user.id,
            name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
            email: user.primaryEmailAddress?.emailAddress,
            migration_status: 'migrated'
          });

        if (profileError) {
          console.error('Error syncing user profile:', profileError);
        }
      }

      // Sync organization memberships
      if (organization && memberships) {
        await syncOrganizationMembership();
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  // Sync organization membership with Supabase
  const syncOrganizationMembership = async () => {
    if (!user || !organization) return;

    try {
      // Check if organization exists in Supabase
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('clerk_org_id', organization.id)
        .single();

      let organizationId;

      if (!orgData) {
        // Create organization in Supabase
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            clerk_org_id: organization.id,
            name: organization.name,
            slug: organization.slug,
            settings: (organization.publicMetadata as any) || {}
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          return;
        }
        organizationId = newOrg.id;
      } else {
        organizationId = orgData.id;
      }

      // Sync membership
      const userMembership = Array.isArray(memberships?.data) ? 
        memberships.data.find((m: any) => m.organization.id === organization.id) : null;
      if (userMembership) {
        await supabase
          .from('organization_memberships')
          .upsert({
            organization_id: organizationId,
            user_id: user.id,
            clerk_user_id: user.id,
            role: userMembership.role.toLowerCase(),
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error syncing organization membership:', error);
    }
  };

  const switchOrganization = async (orgId: string) => {
    try {
      await setActive({ organization: orgId });
      toast.success('Switched organization successfully');
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    }
  };

  const createOrganization = async (name: string, slug?: string) => {
    try {
      const newOrg = await clerkCreateOrganization({ name, slug });
      if (newOrg) {
        toast.success('Organization created successfully');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  const inviteUserToOrganization = async (email: string, role: string = 'member') => {
    if (!organization) return;

    try {
      await organization.inviteMember({
        emailAddress: email,
        role: role as any
      });
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
    }
  };

  const value = {
    user,
    organization,
    organizations: userMemberships?.data?.map((membership: any) => membership.organization) || [],
    isLoaded,
    isSignedIn: isSignedIn || false,
    isLoading,
    supabaseSession,
    switchOrganization,
    createOrganization,
    inviteUserToOrganization
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

// Main provider that wraps with ClerkProvider
export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkAuthProviderInner>
        {children}
      </ClerkAuthProviderInner>
    </ClerkProvider>
  );
}

// Hook to use Clerk auth context
export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
}