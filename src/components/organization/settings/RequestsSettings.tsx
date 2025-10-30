/**
 * Requests Settings - Manage pending membership requests
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { organizationService } from "@/services/organizationService";
import type { OrganizationMembership, OrgRole } from "@/types/organization";
import { toast } from "sonner";
import { UserPlus, Check, X } from "lucide-react";
import { format } from "date-fns";

export function RequestsSettings() {
  const { activeOrganization, refreshOrganization } = useOrganization();
  const { canInviteMembers } = useOrgPermissions(); // Approving requests requires invite permission
  const [requests, setRequests] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<OrgRole>('member');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [activeOrganization?.id]);

  const loadRequests = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const data = await organizationService.getPendingRequests(activeOrganization.id);
      console.log('Loaded pending requests:', data);
      setRequests(data);
    } catch (error) {
      console.error("Error loading pending requests:", error);
      if (error instanceof Error) {
        toast.error(`Failed to load requests: ${error.message}`);
      } else {
        toast.error("Failed to load membership requests. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (membershipId: string) => {
    setSelectedRequest(membershipId);
    setSelectedRole('member'); // Default
    setIsRoleDialogOpen(true);
  };

  const confirmApprovalWithRole = async () => {
    if (!selectedRequest) return;
    
    try {
      await organizationService.approveMembershipRequest(selectedRequest, selectedRole);
      toast.success('Request approved successfully');
      setIsRoleDialogOpen(false);
      setSelectedRequest(null);
      loadRequests();
      refreshOrganization();
    } catch (error: any) {
      console.error('Error approving request:', error);
      
      // Handle already approved case
      if (error?.message?.includes('already been approved') || error?.status === 'already_approved') {
        toast.info('This request has already been approved');
        setIsRoleDialogOpen(false);
        setSelectedRequest(null);
        loadRequests(); // Refresh to remove from list
        refreshOrganization();
      } else {
        toast.error(error?.message || 'Failed to approve request');
      }
    }
  };

  const handleReject = async (membershipId: string) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;

    try {
      await organizationService.rejectMembershipRequest(membershipId);
      toast.success("Request rejected");
      loadRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
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

  const getUserName = (request: OrganizationMembership) => {
    const profile = (request as any).user_profiles;
    // Priority: name -> email -> fallback to "User" with ID
    if (profile?.name && profile.name.trim() !== '') {
      return profile.name;
    }
    if (profile?.email && profile.email.trim() !== '') {
      return profile.email;
    }
    return `User ${request.user_id.substring(0, 8)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Requests</CardTitle>
        <CardDescription>
          Review and approve requests to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(getUserName(request))}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getUserName(request)}</div>
                    <div className="text-sm text-muted-foreground">
                      Requested {format(new Date(request.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pending Approval</Badge>
                  
                  {canInviteMembers && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Role Selection Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Role</DialogTitle>
            <DialogDescription>
              Choose the role for this new member. Each role has different permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as OrgRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Viewer</span>
                    <span className="text-xs text-muted-foreground">Read-only access</span>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Member</span>
                    <span className="text-xs text-muted-foreground">View applications and analytics</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manager</span>
                    <span className="text-xs text-muted-foreground">Create jobs and manage applications</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Full management access</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprovalWithRole}>
              Approve as {selectedRole}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
