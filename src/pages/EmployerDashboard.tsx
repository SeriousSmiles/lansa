import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
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
  const { user } = useUser();
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
      <div className="h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your employer dashboard...</div>
      </div>
    );
  }

  const userName = user?.fullName || user?.firstName || businessData?.company_name || "Employer";

  return (
    <DashboardLayout userName={userName} email={user?.primaryEmailAddress?.emailAddress || ""}>
      <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
              {businessData?.company_name && (
                <p className="text-[#666666] mt-1">{businessData.company_name}</p>
              )}
            </div>
          </div>
          
          <EmployerDashboardTabs businessData={businessData} />
        </div>
      </div>
    </DashboardLayout>
  );
}