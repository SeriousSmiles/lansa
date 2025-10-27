import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { track } = useActionTracking();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadBusinessData() {
      if (!user?.id) return;

      try {
        track('dashboard_visited');

        const { data, error } = await supabase
          .from('business_onboarding_data')
          .select('company_name, business_size, role_function, business_services, company_logo')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching business data:', error);
        } else {
          setBusinessData(data);
          
          // Check if we should show logo upload modal
          // Show only if: 1) No logo uploaded yet, 2) User hasn't skipped
          if (data && !data.company_logo) {
            const { data: userAnswers } = await supabase
              .from('user_answers')
              .select('onboarding_inputs')
              .eq('user_id', user.id)
              .single();
            
            const hasSkipped = (userAnswers?.onboarding_inputs as any)?.company_logo_skipped;
            const hasUploaded = (userAnswers?.onboarding_inputs as any)?.company_logo_uploaded;
            
            if (!hasSkipped && !hasUploaded) {
              // Show modal after a brief delay for better UX
              setTimeout(() => setShowLogoModal(true), 1000);
            }
          }
        }
      } catch (error) {
        console.error('Error loading business data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinessData();
  }, [user?.id, track]);

  if (isLoading) {
    return (
      <div className="employer-theme h-screen bg-background flex items-center justify-center">
        <div className="text-2xl text-foreground animate-pulse">Loading your employer dashboard...</div>
      </div>
    );
  }

  const userName = user?.displayName || businessData?.company_name || "Employer";

  const handleLogoUploadSuccess = async () => {
    // Reload business data to show the new logo
    if (user?.id) {
      const { data } = await supabase
        .from('business_onboarding_data')
        .select('company_name, business_size, role_function, business_services, company_logo')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setBusinessData(data);
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
                  {businessData?.company_name && (
                    <p className="text-muted-foreground mt-1">{businessData.company_name}</p>
                  )}
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