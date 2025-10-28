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

  const handleChangeRole = async (membershipId: string, newRole: OrgRole) => {
    try {
      await organizationService.updateMemberRole(membershipId, newRole);
      toast.success("Member role updated successfully");
      loadMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update member role");
    }
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage members and their roles in your organization
              </CardDescription>
            </div>
            {canInviteMembers && (
              <Button onClick={() => setShowInviteDialog(true)}>
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
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(member.user_id)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">User {member.user_id.substring(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>

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
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "manager")}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Member
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
