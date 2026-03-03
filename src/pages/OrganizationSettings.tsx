import { LansaLoader } from "@/components/shared/LansaLoader";

/**
 * Organization Settings Page
 * Manage organization details, members, invitations, and requests
 */

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Mail, UserPlus } from "lucide-react";
import { GeneralSettings } from "@/components/organization/settings/GeneralSettings";
import { MembersSettings } from "@/components/organization/settings/MembersSettings";
import { InvitationsSettings } from "@/components/organization/settings/InvitationsSettings";
import { RequestsSettings } from "@/components/organization/settings/RequestsSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrgPermissions } from "@/contexts/OrganizationContext";

export default function OrganizationSettings() {
  const { user } = useAuth();
  const { activeOrganization, isLoading } = useOrganization();
  const { canManageOrgSettings } = useOrgPermissions();

  if (isLoading) {
    return <LansaLoader duration={5000} />;
  }

  if (!activeOrganization) {
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl text-foreground">No Organization Found</div>
          <p className="text-muted-foreground">Please create or join an organization first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-theme">
      <DashboardLayout userName={user?.displayName || "User"} email={user?.email || ""}>
        <div className="p-4 md:p-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Organization Settings</h1>
              <p className="text-muted-foreground mt-1">{activeOrganization.name}</p>
            </div>

            {!canManageOrgSettings && (
              <Alert className="mb-6">
                <AlertDescription>
                  You have limited access to organization settings. Contact your organization admin for full access.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Invitations</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Requests</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralSettings />
              </TabsContent>

              <TabsContent value="members">
                <MembersSettings />
              </TabsContent>

              <TabsContent value="invitations">
                <InvitationsSettings />
              </TabsContent>

              <TabsContent value="requests">
                <RequestsSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
