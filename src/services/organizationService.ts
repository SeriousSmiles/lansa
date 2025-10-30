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
  country?: string;
  city?: string;
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

    // Check for duplicate organizations
    const duplicates = await this.checkForDuplicates(data.name, data.domain);
    if (duplicates.length > 0) {
      const exactMatch = duplicates.find(
        org => org.name.toLowerCase() === data.name.toLowerCase() && 
               org.domain === data.domain
      );
      
      if (exactMatch) {
        throw new Error(
          'An organization with this name and domain already exists. ' +
          'If this is your organization, please request to join instead.'
        );
      }
    }

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
    let organization = parsed.organization as Organization;

    // Update with country and city if provided (function doesn't support these yet)
    if (data.country || data.city) {
      const { data: updatedOrg, error: updateError } = await supabase
        .from('organizations')
        .update({
          country: data.country,
          city: data.city,
        })
        .eq('id', organization.id)
        .select()
        .single();

      if (updateError) throw updateError;
      organization = updatedOrg as Organization;
    }

    return {
      organization,
      membership: parsed.membership as OrganizationMembership,
    };
  },

  /**
   * Check for duplicate organizations by name or domain
   */
  async checkForDuplicates(name: string, domain?: string): Promise<Organization[]> {
    let query = supabase
      .from('organizations')
      .select('id, name, domain, country, city')
      .eq('is_active', true);

    if (domain) {
      query = query.or(`name.ilike.${name},domain.eq.${domain}`);
    } else {
      query = query.ilike('name', name);
    }

    const { data } = await query;
    return (data || []) as Organization[];
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

    // Check if user already has a membership (active or pending)
    const { data: existing } = await supabase
      .from('organization_memberships')
      .select('is_active')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        throw new Error('You are already a member of this organization');
      } else {
        throw new Error('You already have a pending request to join this organization');
      }
    }

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
      .select(`
        *,
        user_profiles (
          name,
          profile_image,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback if join fails
      console.warn('Join query failed, using fallback approach:', error);
      
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      // Fetch user profiles separately
      const userIds = memberships.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, profile_image')
        .in('user_id', userIds);

      // Merge the data
      return memberships.map(membership => ({
        ...membership,
        user_profiles: profiles?.find(p => p.user_id === membership.user_id) || null
      })) as OrganizationMembership[];
    }

    return (data || []) as OrganizationMembership[];
  },

  /**
   * Get pending membership requests for an organization
   */
  async getPendingRequests(organizationId: string): Promise<OrganizationMembership[]> {
    const { data, error } = await supabase
      .from('organization_memberships')
      .select(`
        *,
        user_profiles (
          name,
          profile_image,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', false)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback if join fails due to missing FK or other issues
      console.warn('Join query failed, using fallback approach:', error);
      
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      // Fetch user profiles separately
      const userIds = memberships.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, profile_image')
        .in('user_id', userIds);

      // Merge the data
      return memberships.map(membership => ({
        ...membership,
        user_profiles: profiles?.find(p => p.user_id === membership.user_id) || null
      })) as OrganizationMembership[];
    }

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
    if (data?.error) {
      const err: any = new Error(data.error);
      err.status = data.status; // Preserve status field for "already_approved"
      throw err;
    }
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
   * Update a member's role using edge function for proper validation
   */
  async updateMemberRole(membershipId: string, newRole: OrgRole): Promise<void> {
    const { data, error } = await supabase.functions.invoke('change-member-role', {
      body: { membershipId, newRole }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
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
