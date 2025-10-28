/**
 * Invitations Settings - View and manage pending invitations
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { organizationService } from "@/services/organizationService";
import type { OrganizationInvitation } from "@/types/organization";
import { toast } from "sonner";
import { Mail, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export function InvitationsSettings() {
  const { activeOrganization } = useOrganization();
  const { canInviteMembers } = useOrgPermissions();
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, [activeOrganization?.id]);

  const loadInvitations = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const data = await organizationService.getPendingInvitations(activeOrganization.id);
      setInvitations(data);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading invitations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          View and manage invitations sent to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{invitation.email}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                    <span className="capitalize">Role: {invitation.role}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Sent {format(new Date(invitation.created_at), "MMM d, yyyy")}
                    </span>
                    <span>
                      Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpired(invitation.expires_at) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  
                  {canInviteMembers && (
                    <Button variant="ghost" size="sm" disabled>
                      <XCircle className="h-4 w-4" />
                    </Button>
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
