/**
 * Members Settings - Manage organization members
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { organizationService } from "@/services/organizationService";
import type { OrganizationMembership, OrgRole } from "@/types/organization";
import { toast } from "sonner";
import { MoreVertical, Mail, UserX, Shield } from "lucide-react";
import { InviteMemberDialog } from "../InviteMemberDialog";

export function MembersSettings() {
  const { activeOrganization, refreshOrganization } = useOrganization();
  const { canInviteMembers, canRemoveMembers, canManageRoles } = useOrgPermissions();
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [activeOrganization?.id]);

  const loadMembers = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const data = await organizationService.getOrganizationMembers(activeOrganization.id);
      setMembers(data);
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await organizationService.removeMember(membershipId);
      toast.success("Member removed successfully");
      loadMembers();
      refreshOrganization();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleChangeRole = async (membershipId: string, newRole: OrgRole, currentRole: OrgRole) => {
    // Confirmation for critical role changes
    if (currentRole === 'owner' || newRole === 'owner') {
      const confirmed = window.confirm(
        `⚠️ ${newRole === 'owner' 
          ? 'This will promote the member to Owner with full control over the organization.' 
          : 'This will demote the Owner to a lower role. Make sure another Owner exists first.'
        }\n\nContinue?`
      );
      if (!confirmed) return;
    }

    try {
      await organizationService.updateMemberRole(membershipId, newRole);
      toast.success('Member role updated successfully');
      loadMembers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error?.message || 'Failed to update member role');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = (member: OrganizationMembership) => {
    const profile = (member as any).user_profiles;
    // Priority: actual name -> email as name -> fallback to user ID
    if (profile?.name && profile.name.trim() !== '') {
      return profile.name;
    }
    if (profile?.email && profile.email.trim() !== '') {
      return profile.email.split('@')[0]; // Use email username part as name
    }
    return `User ${member.user_id.substring(0, 8)}`;
  };

  const getUserEmail = (member: OrganizationMembership) => {
    const profile = (member as any).user_profiles;
    return profile?.email || 'No email';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage members and their roles in your organization
              </CardDescription>
            </div>
            {canInviteMembers && (
              <Button onClick={() => setShowInviteDialog(true)} className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback>{getInitials(getUserName(member))}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{getUserName(member)}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {getUserEmail(member)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-center">
                  {/* Role Badge with Tooltip */}
                  <div className="text-sm">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${member.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          member.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          member.role === 'manager' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      title={
                        member.role === 'owner' ? 'Full control - can transfer ownership' :
                        member.role === 'admin' ? 'Manage members, roles, settings (except billing)' :
                        member.role === 'manager' ? 'Create/edit jobs, manage applications' :
                        member.role === 'member' ? 'View applications and analytics' :
                        'View-only access'
                      }
                    >
                      {member.role === 'owner' ? '👑 Owner' : member.role}
                    </span>
                  </div>

                  {(canManageRoles || canRemoveMembers) && member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {canManageRoles && (
                          <>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin", member.role)}>
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === 'admin' ? '✓ Admin' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "manager", member.role)}>
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === 'manager' ? '✓ Manager' : 'Make Manager'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member", member.role)}>
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === 'member' ? '✓ Member' : 'Make Member'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {canRemoveMembers && (
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={loadMembers}
      />
    </>
  );
}
