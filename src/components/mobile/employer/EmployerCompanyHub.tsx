import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Building2, Check, CreditCard, HelpCircle, LogOut, Mail, User, UserPlus, Users } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployerGroup, EmployerHeader, EmployerRow } from "./employerUi";

export type CompanySection = "general" | "members" | "invitations" | "requests";

/** Company identity, organization switching, team settings and account controls under the caller's real permissions. */
export function EmployerCompanyHub({ onOpenSection, onBack, title = "Company" }: { onOpenSection: (s: CompanySection) => void; onBack?: () => void; title?: string }) {
  const navigate = useNavigate();
  const { activeOrganization, organizations, switchOrganization } = useOrganization();
  const { canManageOrgSettings, canInviteMembers, canManageBilling, currentRole } = useOrgPermissions();
  const [switching, setSwitching] = useState<string | null>(null);
  const org = activeOrganization;
  const viewOnly = (allowed: boolean) => (allowed ? undefined : "View only");

  const switchTo = async (id: string) => {
    if (id === org?.id) return;
    setSwitching(id);
    try { await switchOrganization(id); } catch { toast.error("Couldn't switch company. Try again."); } finally { setSwitching(null); }
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); navigate("/login"); } catch { toast.error("Couldn't sign out. Try again."); }
  };

  return (
    <div className="ee-screen">
      <EmployerHeader title={title} onBack={onBack} />
      <div className="ee-body ee-fade">
        <div className="ee-identity">
          <div className="ee-logo">{org?.logo_url ? <img src={org.logo_url} alt="" /> : (org?.name || "C").charAt(0).toUpperCase()}</div>
          <h2>{org?.name || "Your company"}</h2>
          {(org?.industry || org?.size_range) && <p className="text-sm text-muted-foreground">{[org?.industry, org?.size_range && `${org.size_range} people`].filter(Boolean).join(" · ")}</p>}
          {currentRole && <span className="ee-role-pill">Your role: {currentRole}</span>}
          {canManageOrgSettings && <button type="button" className="ee-secondary mt-1" onClick={() => onOpenSection("general")}>Edit company profile</button>}
        </div>

        {organizations.length > 1 && (
          <EmployerGroup label="Your companies">
            {organizations.map((m: any) => {
              const selected = m.organization_id === org?.id;
              return (
                <button key={m.organization_id} type="button" className="ee-row" aria-pressed={selected} onClick={() => switchTo(m.organization_id)} disabled={!!switching}>
                  <span className="ee-row-icon"><Building2 size={18} aria-hidden="true" /></span>
                  <span className="ee-row-text"><span className="ee-row-label">{m.organizations?.name || "Company"}</span><span className="ee-row-detail capitalize">{m.role}</span></span>
                  <span className="ee-row-trail">{selected ? <Check size={20} className="text-primary" aria-label="Current company" /> : switching === m.organization_id ? "Switching…" : null}</span>
                </button>
              );
            })}
          </EmployerGroup>
        )}

        <EmployerGroup label="Team & settings">
          <EmployerRow icon={Building2} label="Company details" detail={viewOnly(canManageOrgSettings)} onClick={() => onOpenSection("general")} />
          <EmployerRow icon={Users} label="Members" onClick={() => onOpenSection("members")} />
          <EmployerRow icon={Mail} label="Invitations" detail={viewOnly(canInviteMembers)} onClick={() => onOpenSection("invitations")} />
          <EmployerRow icon={UserPlus} label="Join requests" detail={viewOnly(canInviteMembers)} onClick={() => onOpenSection("requests")} />
          {canManageBilling && <EmployerRow icon={CreditCard} label="Plan & pricing" onClick={() => navigate("/pricing")} />}
        </EmployerGroup>

        <EmployerGroup label="Account">
          <EmployerRow icon={User} label="My profile" onClick={() => navigate("/profile")} />
          <EmployerRow icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <EmployerRow icon={HelpCircle} label="Help" onClick={() => navigate("/help")} />
          <EmployerRow icon={LogOut} label="Sign out" danger onClick={signOut} />
        </EmployerGroup>
      </div>
    </div>
  );
}
