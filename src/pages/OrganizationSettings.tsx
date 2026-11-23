import { LansaLoader } from "@/components/shared/LansaLoader";

/**
 * Organization Settings Page
 * Phone: native grouped list with drill-in sections (?section=). Desktop: section rail + panel.
 */

import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Building2, Users, Mail, UserPlus } from "lucide-react";
import { GeneralSettings } from "@/components/organization/settings/GeneralSettings";
import { MembersSettings } from "@/components/organization/settings/MembersSettings";
import { InvitationsSettings } from "@/components/organization/settings/InvitationsSettings";
import { RequestsSettings } from "@/components/organization/settings/RequestsSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmployerCompanyHub, type CompanySection } from "@/components/mobile/employer/EmployerCompanyHub";
import { EmployerHeader } from "@/components/mobile/employer/employerUi";

const SECTIONS: Array<{ id: CompanySection; label: string; icon: typeof Building2; Panel: () => JSX.Element }> = [
  { id: "general", label: "Company details", icon: Building2, Panel: GeneralSettings },
  { id: "members", label: "Members", icon: Users, Panel: MembersSettings },
  { id: "invitations", label: "Invitations", icon: Mail, Panel: InvitationsSettings },
  { id: "requests", label: "Join requests", icon: UserPlus, Panel: RequestsSettings },
];

export default function OrganizationSettings() {
  const { user } = useAuth();
  const { activeOrganization, isLoading } = useOrganization();
  const { canManageOrgSettings } = useOrgPermissions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requested = params.get("section") as CompanySection | null;
  const section = SECTIONS.find((s) => s.id === requested);

  if (isLoading) return <LansaLoader duration={5000} />;

  if (!activeOrganization) {
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center p-6">
        <div className="ee-empty">
          <h3>No organization found</h3>
          <p>Create or join an organization first.</p>
          <button className="ee-primary" onClick={() => navigate("/onboarding")}>Set up organization</button>
        </div>
      </div>
    );
  }

  const open = (id: CompanySection) => setParams({ section: id });
  const limited = !canManageOrgSettings && (
    <Alert className="mb-4 rounded-2xl border-0 bg-card">
      <AlertDescription>You have view-only access to some settings. An organization admin can change your role.</AlertDescription>
    </Alert>
  );

  if (isMobile) {
    return (
      <div className="employer-theme employer-phone">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {section ? (
            <div className="ee-screen" key={section.id}>
              <EmployerHeader title={section.label} onBack={() => setParams({})} backLabel="Back to company" />
              <div className="ee-body ee-fade">{limited}<section.Panel /></div>
            </div>
          ) : (
            <EmployerCompanyHub title="Company settings" onOpenSection={open} onBack={() => navigate("/employer-dashboard?tab=company")} />
          )}
        </div>
      </div>
    );
  }

  const Active = section ?? SECTIONS[0];
  return (
    <div className="employer-theme">
      <DashboardLayout userName={user?.displayName || "User"} email={user?.email || ""}>
        <div className="py-4 md:py-6 ee-desktop-wide">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold">Company settings</h1>
            <p className="text-muted-foreground mt-1">{activeOrganization.name}</p>
          </div>
          {limited}
          <div className="ee-desktop-settings">
            <nav aria-label="Settings sections" className="ee-group p-2 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" aria-current={Active.id === s.id ? "page" : undefined} onClick={() => open(s.id)}
                  className={`ee-row rounded-xl !border-0 ${Active.id === s.id ? "bg-foreground text-background [&_.ee-row-label]:text-background" : ""}`}>
                  <span className="ee-row-icon"><s.icon size={18} aria-hidden="true" /></span>
                  <span className="ee-row-text"><span className="ee-row-label">{s.label}</span></span>
                </button>
              ))}
            </nav>
            <div className="min-w-0 ee-fade" key={Active.id}><Active.Panel /></div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
