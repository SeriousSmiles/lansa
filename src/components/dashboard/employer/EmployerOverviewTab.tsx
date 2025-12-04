import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Users, FileText, TrendingUp, Settings } from "lucide-react";
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
}

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  candidatesViewed: number;
}

interface UserOrgRole {
  role: string;
}

export function EmployerOverviewTab({ businessData }: EmployerOverviewTabProps) {
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
        // Fetch user's role in the organization
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

        // ✅ FIXED: Count active job listings for this organization (using job_listings_v2)
        const { count: jobCount } = await supabase
          .from('job_listings_v2')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id)
          .eq('is_active', true);

        // Count candidate views for this organization
        const { count: swipeCount } = await supabase
          .from('swipes')
          .select('*', { count: 'exact', head: true })
          .eq('swiper_user_id', user?.id || '');

        // ✅ FIXED: Count organization-wide applications
        const { count: appCount } = await supabase
          .from('job_applications_v2')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id);
        
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

  return (
    <div className="space-y-6">
      {/* Welcome Section with Organization Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {activeOrganization?.logo_url ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeOrganization.logo_url} alt={activeOrganization.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {activeOrganization.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            )}
            <span>Welcome to Your Employer Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrganization && (
              <>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Organization Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Name:</span> <span className="text-foreground">{activeOrganization.name}</span></p>
                    {activeOrganization.size_range && (
                      <p><span className="font-medium text-muted-foreground">Size:</span> <span className="text-foreground">{activeOrganization.size_range}</span></p>
                    )}
                    {activeOrganization.industry && (
                      <p><span className="font-medium text-muted-foreground">Industry:</span> <span className="text-foreground">{activeOrganization.industry}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your Role</h3>
                  <Badge variant="secondary" className="text-sm capitalize">
                    {userRole}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666666]">Active Job Listings</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stats.activeJobs}</p>
              </div>
              <FileText className="h-8 w-8 text-[#FF6B4A]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666666]">Candidates Viewed</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stats.candidatesViewed}</p>
              </div>
              <Users className="h-8 w-8 text-[#FF6B4A]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#666666]">Total Applications</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stats.totalApplications}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#FF6B4A]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-[#2E2E2E] mb-2">Post a New Job</h3>
              <p className="text-sm text-[#666666]">Create a new job listing to attract top talent</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-[#2E2E2E] mb-2">Browse Candidates</h3>
              <p className="text-sm text-[#666666]">Discover skilled professionals looking for opportunities</p>
            </div>
            {canManageOrgSettings && (
              <div 
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/organization/settings')}
              >
                <h3 className="font-semibold text-[#2E2E2E] mb-2">
                  <Settings className="inline h-4 w-4 mr-2" />
                  Organization Settings
                </h3>
                <p className="text-sm text-[#666666]">Manage members, invitations, and organization details</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}