import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmployerDashboardTabs } from "@/components/dashboard/EmployerDashboardTabs";
import { supabase } from "@/integrations/supabase/client";
import { useActionTracking } from "@/hooks/useActionTracking";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
}

export default function EmployerDashboard() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { track } = useActionTracking();

  useEffect(() => {
    async function loadBusinessData() {
      if (!user?.id) return;

      try {
        track('dashboard_visited');

        const { data, error } = await supabase
          .from('business_onboarding_data')
          .select('company_name, business_size, role_function, business_services')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching business data:', error);
        } else {
          setBusinessData(data);
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
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-heading text-foreground animate-pulse">Loading your employer dashboard...</div>
      </div>
    );
  }

  const userName = user?.displayName || businessData?.company_name || "Employer";

  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-6 md:p-8 h-[calc(100vh-72px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-display text-foreground">Employer Dashboard</h1>
              {businessData?.company_name && (
                <p className="text-caption">{businessData.company_name}</p>
              )}
            </div>
          </div>
          
          <EmployerDashboardTabs businessData={businessData} />
        </div>
      </div>
    </DashboardLayout>
  );
}