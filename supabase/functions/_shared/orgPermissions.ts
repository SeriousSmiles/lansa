import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { AuthorizationError } from "./guard.ts";

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

const ROLE_PERMISSIONS: Record<OrgRole, OrgPermission[] | ['*']> = {
  owner: ['*'], // All permissions
  admin: [
    'invite_members', 'remove_members', 'manage_roles',
    'create_jobs', 'edit_jobs', 'delete_jobs',
    'view_applications', 'manage_applications',
    'view_analytics', 'manage_org_settings'
  ],
  manager: [
    'create_jobs', 'edit_jobs',
    'view_applications', 'manage_applications',
    'view_analytics'
  ],
  member: ['view_applications', 'view_analytics'],
  viewer: []
};

interface OrgMembership {
  role: OrgRole;
  is_active: boolean;
  organization_id: string;
}

/**
 * Get user's organization membership
 */
export async function getOrgMembership(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<OrgMembership | null> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('role, is_active, organization_id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('[orgPermissions] Error fetching membership:', error);
    return null;
  }

  return data as OrgMembership | null;
}

/**
 * Check if user has specific permission in organization
 */
export async function requireOrgPermission(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  permission: OrgPermission
): Promise<OrgMembership> {
  const membership = await getOrgMembership(supabase, userId, organizationId);

  if (!membership) {
    throw new AuthorizationError(
      'You are not a member of this organization',
      'forbidden'
    );
  }

  const permissions = ROLE_PERMISSIONS[membership.role as OrgRole] || [];
  const hasPermission = permissions.includes('*') || permissions.includes(permission);

  if (!hasPermission) {
    throw new AuthorizationError(
      `Insufficient permissions. Required: ${permission}. Your role: ${membership.role}`,
      'forbidden'
    );
  }

  return membership;
}

/**
 * Check if user has any of the specified roles
 */
export async function requireOrgRole(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  allowedRoles: OrgRole[]
): Promise<OrgMembership> {
  const membership = await getOrgMembership(supabase, userId, organizationId);

  if (!membership) {
    throw new AuthorizationError(
      'You are not a member of this organization',
      'forbidden'
    );
  }

  if (!allowedRoles.includes(membership.role as OrgRole)) {
    throw new AuthorizationError(
      `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${membership.role}`,
      'forbidden'
    );
  }

  return membership;
}

/**
 * Check if user can perform action on another member
 * (e.g., owner/admin can manage other members)
 */
export async function canManageMember(
  supabase: SupabaseClient,
  actorUserId: string,
  targetUserId: string,
  organizationId: string
): Promise<boolean> {
  // Get both memberships
  const [actorMembership, targetMembership] = await Promise.all([
    getOrgMembership(supabase, actorUserId, organizationId),
    getOrgMembership(supabase, targetUserId, organizationId)
  ]);

  if (!actorMembership || !targetMembership) {
    return false;
  }

  // Owner can manage everyone
  if (actorMembership.role === 'owner') return true;

  // Admin can manage non-owners
  if (actorMembership.role === 'admin' && targetMembership.role !== 'owner') {
    return true;
  }

  return false;
}
