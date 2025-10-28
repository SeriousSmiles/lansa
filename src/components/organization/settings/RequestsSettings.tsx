/**
 * Requests Settings - Manage pending membership requests
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { organizationService } from "@/services/organizationService";
import type { OrganizationMembership } from "@/types/organization";
import { toast } from "sonner";
import { UserPlus, Check, X } from "lucide-react";
import { format } from "date-fns";

export function RequestsSettings() {
  const { activeOrganization, refreshOrganization } = useOrganization();
  const { canInviteMembers } = useOrgPermissions(); // Approving requests requires invite permission
  const [requests, setRequests] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [activeOrganization?.id]);

  const loadRequests = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const data = await organizationService.getPendingRequests(activeOrganization.id);
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (membershipId: string) => {
    try {
      await organizationService.approveMembershipRequest(membershipId);
      toast.success("Request approved successfully");
      loadRequests();
      refreshOrganization();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
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

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
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
                    <AvatarFallback>{getInitials(request.user_id)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">User {request.user_id.substring(0, 8)}</div>
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
    </Card>
  );
}
