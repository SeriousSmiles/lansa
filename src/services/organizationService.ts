/**
 * Organization Service
 * Handles all organization-related operations
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Organization,
  OrganizationMembership,
  OrganizationInvitation,
  OrgRole,
} from '@/types/organization';

export interface CreateOrganizationData {
  name: string;
  industry?: string;
  size_range?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  domain?: string;
}

export const organizationService = {
  /**
   * Create a new organization with the current user as owner
   */
  async createOrganization(
    data: CreateOrganizationData
  ): Promise<{ organization: Organization; membership: OrganizationMembership }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Use security definer function to atomically create org + membership
    const { data: result, error } = await supabase.rpc('create_organization_with_owner', {
      p_name: data.name,
      p_industry: data.industry,
      p_size_range: data.size_range,
      p_description: data.description,
      p_logo_url: data.logo_url,
      p_website: data.website,
      p_domain: data.domain,
    });

    if (error) throw error;
    if (!result) throw new Error('Failed to create organization');

    const parsed = result as any;
    return {
      organization: parsed.organization as Organization,
      membership: parsed.membership as OrganizationMembership,
    };
  },

  /**
   * Get all organizations the current user belongs to
   */
  async getUserOrganizations(): Promise<OrganizationMembership[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('organization_memberships')
      .select('*, organization:organizations(*)')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []) as OrganizationMembership[];
  },

  /**
   * Get organization by ID
   */
  async getOrganizationById(organizationId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) return null;
    return data as Organization;
  },

  /**
   * Get user's membership in an organization
   */
  async getMembership(organizationId: string): Promise<OrganizationMembership | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('organization_memberships')
      .select('*, organization:organizations(*)')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return null;
    return data as OrganizationMembership | null;
  },

  /**
   * Search organizations by name (for join flow)
   */
  async searchOrganizations(query: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(10);

    if (error) throw error;
    return (data || []) as Organization[];
  },

  /**
   * Request to join an organization (creates pending membership)
   */
  async requestToJoinOrganization(organizationId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('organization_memberships').insert({
      organization_id: organizationId,
      user_id: user.id,
      role: 'member',
      is_active: false, // Pending approval
    });

    if (error) throw error;
  },

  /**
   * Invite a user to an organization
   */
  async inviteToOrganization(
    organizationId: string,
    email: string,
    role: OrgRole = 'member'
  ): Promise<OrganizationInvitation> {
    const { data, error } = await supabase.functions.invoke('invite-org-member', {
      body: { organizationId, email, role },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    return data.invitation;
  },

  /**
   * Accept an invitation to join an organization
   */
  async acceptInvitation(token: string): Promise<OrganizationMembership> {
    const { data, error } = await supabase.functions.invoke('accept-org-invitation', {
      body: { token },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    return data.membership;
  },

  /**
   * Get all members of an organization
   */
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMembership[]> {
    const { data, error } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OrganizationMembership[];
  },

  /**
   * Get pending membership requests for an organization
   */
  async getPendingRequests(organizationId: string): Promise<OrganizationMembership[]> {
    const { data, error } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OrganizationMembership[];
  },

  /**
   * Get pending invitations for an organization
   */
  async getPendingInvitations(
    organizationId: string
  ): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OrganizationInvitation[];
  },

  /**
   * Approve a pending membership request
   */
  async approveMembershipRequest(membershipId: string, role: OrgRole = 'member'): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-org-request', {
      body: { membershipId, action: 'approve', role },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
  },

  /**
   * Reject a pending membership request
   */
  async rejectMembershipRequest(membershipId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-org-request', {
      body: { membershipId, action: 'reject' },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
  },

  /**
   * Update member role
   */
  async updateMemberRole(membershipId: string, newRole: OrgRole): Promise<void> {
    const { error } = await supabase
      .from('organization_memberships')
      .update({ role: newRole })
      .eq('id', membershipId);

    if (error) throw error;
  },

  /**
   * Remove a member from an organization
   */
  async removeMember(membershipId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_memberships')
      .delete()
      .eq('id', membershipId);

    if (error) throw error;
  },

  /**
   * Update organization details
   */
  async updateOrganization(
    organizationId: string,
    updates: Partial<Organization>
  ): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data as Organization;
  },
};
