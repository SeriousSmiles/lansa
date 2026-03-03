import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useUserState } from "@/contexts/UnifiedAuthProvider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmployerDashboardTabs } from "@/components/dashboard/EmployerDashboardTabs";
import { supabase } from "@/integrations/supabase/client";
import { useActionTracking } from "@/hooks/useActionTracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogoUploadModal } from "@/components/employer/CompanyLogoUploadModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileEmployerTabs } from "@/components/mobile/employer/MobileEmployerTabs";
import { PendingRequestBanner } from "@/components/organization/PendingRequestBanner";
import { QuickActionsWidget } from "@/components/organization/QuickActionsWidget";
import { LansaLoader } from "@/components/shared/LansaLoader";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
  company_logo?: string;
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const { user } = useAuth();
  const { activeOrganization, pendingMembership, hasPendingRequest, isLoading: orgLoading, refreshOrganization } = useOrganization();
  const { refreshUserState } = useUserState();
  const { track } = useActionTracking();
  const isMobile = useIsMobile();

  const loadBusinessData = useCallback(async () => {
      if (!user?.id || !activeOrganization?.id) {
        setIsLoading(false);
        return;
      }

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
  }, [user?.id, activeOrganization?.id, track]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  const handleRefreshDashboard = async () => {
    setIsRefreshingDashboard(true);
    try {
      await Promise.all([
        refreshOrganization?.(),
        refreshUserState?.()
      ]);
      await loadBusinessData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshingDashboard(false);
    }
  };

  if (isLoading || orgLoading) {
    return <LansaLoader duration={5000} />;
  }

  if (!activeOrganization) {
    if (hasPendingRequest && pendingMembership) {
      const pendingOrgName = (pendingMembership as any).organizations?.name;
      const requestSentAt = pendingMembership.created_at;
      
      return (
        <div className="employer-theme h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <PendingRequestBanner 
              organizationName={pendingOrgName}
              requestSentAt={requestSentAt}
            />
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">Your account is ready to use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Join Request Sent</p>
                    <p className="text-sm text-muted-foreground">Waiting for admin approval</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-muted-foreground">Approval Pending</p>
                    <p className="text-sm text-muted-foreground">You'll receive an email when approved</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                While you wait, you can close this page. We'll notify you by email once your request is reviewed.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-2xl font-semibold text-foreground">No Organization Found</div>
          <p className="text-muted-foreground">You need an organization to access the employer dashboard.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/onboarding')}>
              Set Up Organization
            </Button>
          </div>
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
          <div className="p-4 md:p-6">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 animate-fade-in">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
                    <Badge variant="secondary" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">{activeOrganization.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshDashboard}
                  disabled={isRefreshingDashboard}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingDashboard ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <EmployerDashboardTabs businessData={businessData} />
            </div>
          </div>
        </DashboardLayout>
      </div>
      
      {/* Quick Actions Widget - placed outside DashboardLayout for proper fixed positioning */}
      <QuickActionsWidget />
      
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