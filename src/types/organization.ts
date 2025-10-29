/**
 * Organization & Membership Type Definitions
 */

export interface Organization {
  id: string;
  name: string;
  clerk_org_id: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size_range?: string;
  plan_type?: string;
  settings?: Record<string, any>;
  is_active: boolean;
  verification_status?: string;
  verified_at?: string;
  verified_by?: string;
  domain?: string;
  country?: string;
  city?: string;
  seat_limit?: number;
  billing_status?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  permissions?: string[];
  is_active: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  token: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  organization?: Organization;
}

export type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export type OrgPermission =
  | 'invite_members'
  | 'remove_members'
  | 'manage_roles'
  | 'create_jobs'
  | 'edit_jobs'
  | 'delete_jobs'
  | 'view_applications'
  | 'manage_applications'
  | 'view_analytics'
  | 'manage_org_settings'
  | 'manage_billing';

export const ROLE_PERMISSIONS: Record<OrgRole, OrgPermission[]> = {
  owner: [
    'invite_members',
    'remove_members',
    'manage_roles',
    'create_jobs',
    'edit_jobs',
    'delete_jobs',
    'view_applications',
    'manage_applications',
    'view_analytics',
    'manage_org_settings',
    'manage_billing',
  ],
  admin: [
    'invite_members',
    'remove_members',
    'manage_roles',
    'create_jobs',
    'edit_jobs',
    'delete_jobs',
    'view_applications',
    'manage_applications',
    'view_analytics',
    'manage_org_settings',
  ],
  manager: [
    'create_jobs',
    'edit_jobs',
    'view_applications',
    'manage_applications',
    'view_analytics',
  ],
  member: ['view_applications', 'view_analytics'],
  viewer: [],
};
