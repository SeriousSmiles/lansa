import { useOrganization } from '@/contexts/OrganizationContext';
import { ROLE_PERMISSIONS, type OrgPermission } from '@/types/organization';

export function useOrgPermissions() {
  const { activeMembership, can, isOwner, isAdmin } = useOrganization();

  return {
    // Core permission check
    can: (permission: OrgPermission) => can(permission),
    
    // Role checks
    isOwner: isOwner(),
    isAdmin: isAdmin(),
    isManager: activeMembership?.role === 'manager',
    isMember: activeMembership?.role === 'member',
    isViewer: activeMembership?.role === 'viewer',
    
    // Specific permission checks
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
    
    // Current role
    currentRole: activeMembership?.role || null,
    
    // All permissions for current role
    allPermissions: activeMembership?.role 
      ? ROLE_PERMISSIONS[activeMembership.role] 
      : [],
  };
}
