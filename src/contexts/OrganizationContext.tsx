/**
 * Organization Context
 * Manages active organization and user's membership state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { organizationService } from '@/services/organizationService';
import type {
  Organization,
  OrganizationMembership,
  OrgPermission,
} from '@/types/organization';
import { ROLE_PERMISSIONS } from '@/types/organization';

interface OrganizationContextValue {
  activeOrganization: Organization | null;
  activeMembership: OrganizationMembership | null;
  pendingMembership: OrganizationMembership | null;
  organizations: OrganizationMembership[];
  isLoading: boolean;
  hasPendingRequest: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
  can: (permission: OrgPermission) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

const ACTIVE_ORG_KEY = 'lansa_active_organization';

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [activeMembership, setActiveMembership] = useState<OrganizationMembership | null>(
    null
  );
  const [pendingMembership, setPendingMembership] = useState<OrganizationMembership | null>(
    null
  );
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  /**
   * Load user's organizations on auth
   */
  const loadOrganizations = useCallback(async () => {
    if (!user?.id) {
      setOrganizations([]);
      setActiveOrganization(null);
      setActiveMembership(null);
      setPendingMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch all memberships (both active and pending) with organization details
      const { data: allMemberships, error } = await supabase
        .from('organization_memberships')
        .select('*, organizations(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const activeMemberships = (allMemberships || []).filter((m) => m.is_active);
      const pendingMemberships = (allMemberships || []).filter((m) => !m.is_active);

      setOrganizations(activeMemberships as OrganizationMembership[]);
      setHasPendingRequest(pendingMemberships.length > 0);
      
      if (pendingMemberships.length > 0) {
        setPendingMembership(pendingMemberships[0] as OrganizationMembership);
      } else {
        setPendingMembership(null);
      }

      // Set active organization
      if (activeMemberships.length > 0) {
        // Try to restore from localStorage
        const savedOrgId = localStorage.getItem(ACTIVE_ORG_KEY);
        const savedMembership = activeMemberships.find(
          (m) => m.organization_id === savedOrgId
        );

        const membership = savedMembership || activeMemberships[0];
        setActiveMembership(membership as OrganizationMembership);
        setActiveOrganization((membership as any).organizations as Organization);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  /**
   * Switch active organization
   */
  const switchOrganization = useCallback(
    async (organizationId: string) => {
      const membership = organizations.find((m) => m.organization_id === organizationId);
      if (!membership || !membership.is_active) {
        console.error('Cannot switch to inactive or non-existent organization');
        return;
      }

      setActiveMembership(membership);
      setActiveOrganization(membership.organization as Organization);
      localStorage.setItem(ACTIVE_ORG_KEY, organizationId);
    },
    [organizations]
  );

  /**
   * Refresh organization data (force reload)
   */
  const refreshOrganization = useCallback(async () => {
    setIsLoading(true);
    try {
      const memberships = await organizationService.getUserOrganizations();
      setOrganizations(memberships);

      // Check for pending requests
      const pendingMemberships = memberships.filter((m) => !m.is_active);
      setHasPendingRequest(pendingMemberships.length > 0);
      if (pendingMemberships.length > 0) {
        setPendingMembership(pendingMemberships[0]);
      } else {
        setPendingMembership(null);
      }

      // Set active organization
      if (memberships.length > 0) {
        const activeMemberships = memberships.filter((m) => m.is_active);
        if (activeMemberships.length > 0) {
          // Try to restore from localStorage or use first active
          const savedOrgId = localStorage.getItem(ACTIVE_ORG_KEY);
          const savedMembership = activeMemberships.find(
            (m) => m.organization_id === savedOrgId
          );

          const membership = savedMembership || activeMemberships[0];
          setActiveMembership(membership);
          setActiveOrganization(membership.organization as Organization);
        }
      }
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user has a specific permission
   */
  const can = useCallback(
    (permission: OrgPermission): boolean => {
      if (!activeMembership) return false;
      const permissions = ROLE_PERMISSIONS[activeMembership.role];
      return permissions.includes(permission);
    },
    [activeMembership]
  );

  /**
   * Check if user is owner
   */
  const isOwner = useCallback((): boolean => {
    return activeMembership?.role === 'owner';
  }, [activeMembership]);

  /**
   * Check if user is admin or owner
   */
  const isAdmin = useCallback((): boolean => {
    return activeMembership?.role === 'admin' || activeMembership?.role === 'owner';
  }, [activeMembership]);

  const value: OrganizationContextValue = {
    activeOrganization,
    activeMembership,
    pendingMembership,
    organizations,
    isLoading,
    hasPendingRequest,
    switchOrganization,
    refreshOrganization,
    can,
    isOwner,
    isAdmin,
  };

  return (
    <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
  );
}

/**
 * Hook to access organization context
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

/**
 * Hook for permission checking
 */
export function useOrgPermissions() {
  const { can, isOwner, isAdmin } = useOrganization();

  return {
    can,
    isOwner: isOwner(),
    isAdmin: isAdmin(),
    canInviteMembers: can('invite_members'),
    canRemoveMembers: can('remove_members'),
    canManageRoles: can('manage_roles'),
    canCreateJobs: can('create_jobs'),
    canEditJobs: can('edit_jobs'),
    canDeleteJobs: can('delete_jobs'),
    canViewApplications: can('view_applications'),
    canManageApplications: can('manage_applications'),
    canViewAnalytics: can('view_analytics'),
    canManageOrgSettings: can('manage_org_settings'),
    canManageBilling: can('manage_billing'),
  };
}
