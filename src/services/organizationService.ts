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

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        clerk_org_id: `org-${Date.now()}`,
        slug,
        industry: data.industry,
        size_range: data.size_range,
        description: data.description,
        logo_url: data.logo_url,
        website: data.website,
        domain: data.domain,
        is_active: true,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Create membership as owner
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
        is_active: true,
      })
      .select()
      .single();

    if (membershipError) throw membershipError;

    return { 
      organization: organization as Organization, 
      membership: membership as OrganizationMembership 
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as OrganizationInvitation;
  },

  /**
   * Accept an invitation to join an organization
   */
  async acceptInvitation(token: string): Promise<OrganizationMembership> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*, organization:organizations(*)')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) throw new Error('Invalid invitation');

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role as OrgRole,
        is_active: true,
        invited_by: invitation.invited_by,
      })
      .select()
      .single();

    if (membershipError) throw membershipError;

    // Mark invitation as accepted
    await supabase
      .from('organization_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return membership as OrganizationMembership;
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
  async approveMembershipRequest(membershipId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_memberships')
      .update({ is_active: true })
      .eq('id', membershipId);

    if (error) throw error;
  },

  /**
   * Reject a pending membership request
   */
  async rejectMembershipRequest(membershipId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_memberships')
      .delete()
      .eq('id', membershipId);

    if (error) throw error;
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
