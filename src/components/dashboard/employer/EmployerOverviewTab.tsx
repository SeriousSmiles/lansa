import { EmployerWorkspace } from "../EmployerWorkspace";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { supabase } from "@/integrations/supabase/client";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
}

interface EmployerOverviewTabProps {
  businessData: BusinessData | null;
  onTabChange?: (tab: string) => void;
}

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  candidatesViewed: number;
}

export function EmployerOverviewTab({ businessData, onTabChange }: EmployerOverviewTabProps) {
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    candidatesViewed: 0
  });
  const [userRole, setUserRole] = useState<string>('member');
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { canManageOrgSettings } = useOrgPermissions();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      if (!activeOrganization?.id || !user?.id) return;

      try {
        const { data: membership } = await supabase
          .from('organization_memberships')
          .select('role')
          .eq('organization_id', activeOrganization.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
        
        if (membership?.role) {
          setUserRole(membership.role);
        }

        const [
          { count: jobCount },
          { count: swipeCount },
          { count: appCount },
        ] = await Promise.all([
          supabase
            .from('job_listings_v2')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id)
            .eq('is_active', true),
          supabase
            .from('swipes')
            .select('*', { count: 'exact', head: true })
            .eq('swiper_user_id', user.id),
          supabase
            .from('job_applications_v2')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id),
        ]);

        setStats({
          activeJobs: jobCount || 0,
          totalApplications: appCount || 0,
          candidatesViewed: swipeCount || 0
        });
      } catch (error) {
        console.error('Error loading employer stats:', error);
      }
    }

    loadStats();
  }, [activeOrganization?.id, user?.id]);

  const handlePostJob = () => {
    if (onTabChange) {
      onTabChange('jobs');
    } else {
      navigate('/employer-dashboard?tab=jobs');
    }
  };

  const handleBrowseCandidates = () => {
    navigate('/browse-candidates');
  };

  return (
    <EmployerWorkspace stats={stats} onPostJob={handlePostJob} onBrowseCandidates={handleBrowseCandidates} onManageJobs={handlePostJob} onViewAnalytics={() => onTabChange?.("analytics")} onSettings={canManageOrgSettings ? () => navigate("/organization/settings") : undefined}>
      <section className="border-t border-border pt-5">
        <h2 className="text-lg font-bold mb-3">Your team</h2>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0"><AvatarImage src={activeOrganization?.logo_url || undefined} alt={activeOrganization?.name || "Organization"} /><AvatarFallback className="bg-accent text-primary"><Building2 className="h-5 w-5" /></AvatarFallback></Avatar>
          <div className="min-w-0"><p className="font-semibold break-words">{activeOrganization?.name}</p><p className="text-xs text-muted-foreground mt-1">{[activeOrganization?.industry, activeOrganization?.size_range].filter(Boolean).join(" · ")}</p></div>
          <Badge variant="outline" className="ml-auto capitalize shrink-0">{userRole}</Badge>
        </div>
      </section>
    </EmployerWorkspace>
  );
}
