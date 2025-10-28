import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmployerDashboardTabs } from "@/components/dashboard/EmployerDashboardTabs";
import { supabase } from "@/integrations/supabase/client";
import { useActionTracking } from "@/hooks/useActionTracking";
import { Badge } from "@/components/ui/badge";
import { CompanyLogoUploadModal } from "@/components/employer/CompanyLogoUploadModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileEmployerTabs } from "@/components/mobile/employer/MobileEmployerTabs";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
  company_logo?: string;
}

export default function EmployerDashboard() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const { user } = useAuth();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { track } = useActionTracking();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadBusinessData() {
      if (!user?.id || !activeOrganization?.id) return;

      try {
        track('dashboard_visited');

        // ✅ FIXED: Load from business_profiles linked to organization
        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('company_name, company_size, industry')
          .eq('organization_id', activeOrganization.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching business profile:', profileError);
        }

        // Fallback to business_onboarding_data for legacy support
        const { data: onboardingData } = await supabase
          .from('business_onboarding_data')
          .select('company_name, business_size, role_function, business_services, company_logo')
          .eq('user_id', user.id)
          .maybeSingle();

        // Merge data with organization data taking precedence
        const merged = {
          company_name: activeOrganization.name || profile?.company_name || onboardingData?.company_name || '',
          business_size: activeOrganization.size_range || profile?.company_size || onboardingData?.business_size || '',
          role_function: onboardingData?.role_function || 'Member',
          business_services: activeOrganization.industry || profile?.industry || onboardingData?.business_services || '',
          company_logo: activeOrganization.logo_url || onboardingData?.company_logo
        };

        setBusinessData(merged);
        
        // Check if we should show logo upload modal
        if (!merged.company_logo) {
          const { data: userAnswers } = await supabase
            .from('user_answers')
            .select('onboarding_inputs')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const hasSkipped = (userAnswers?.onboarding_inputs as any)?.company_logo_skipped;
          const hasUploaded = (userAnswers?.onboarding_inputs as any)?.company_logo_uploaded;
          
          if (!hasSkipped && !hasUploaded) {
            setTimeout(() => setShowLogoModal(true), 1000);
          }
        }
      } catch (error) {
        console.error('Error loading business data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinessData();
  }, [user?.id, activeOrganization?.id, track]);

  if (isLoading || orgLoading) {
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center">
        <div className="text-2xl text-foreground animate-pulse">Loading your employer dashboard...</div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl text-foreground">No Organization Found</div>
          <p className="text-muted-foreground">Please create or join an organization to access the employer dashboard.</p>
        </div>
      </div>
    );
  }

  const userName = user?.displayName || activeOrganization.name || "Employer";

  const handleLogoUploadSuccess = async () => {
    // Reload business data to show the new logo
    if (user?.id && activeOrganization?.id) {
      const { data: onboardingData } = await supabase
        .from('business_onboarding_data')
        .select('company_name, business_size, role_function, business_services, company_logo')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (onboardingData) {
        setBusinessData({
          ...businessData,
          company_logo: onboardingData.company_logo
        } as BusinessData);
      }
    }
  };

  if (isMobile) {
    return (
      <>
        <MobileEmployerTabs businessData={businessData} />
        {user?.id && (
          <CompanyLogoUploadModal
            open={showLogoModal}
            onOpenChange={setShowLogoModal}
            userId={user.id}
            companyName={businessData?.company_name}
            onSuccess={handleLogoUploadSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="employer-theme">
        <DashboardLayout userName={userName} email={user?.email || ""}>
          <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 animate-fade-in">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
                    <Badge variant="secondary" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">{activeOrganization.name}</p>
                </div>
              </div>
              <EmployerDashboardTabs businessData={businessData} />
            </div>
          </div>
        </DashboardLayout>
      </div>
      
      {user?.id && (
        <CompanyLogoUploadModal
          open={showLogoModal}
          onOpenChange={setShowLogoModal}
          userId={user.id}
          companyName={businessData?.company_name}
          onSuccess={handleLogoUploadSuccess}
        />
      )}
    </>
  );
}