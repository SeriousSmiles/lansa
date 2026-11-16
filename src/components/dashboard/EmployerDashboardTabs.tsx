import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, BarChart3, Settings, CreditCard } from "lucide-react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { EmployerOverviewTab } from "./employer/EmployerOverviewTab";
import { JobManagementTab } from "./employer/JobManagementTab";
import { EmployerAnalyticsTab } from "./employer/EmployerAnalyticsTab";
import { EmployerSubscriptionPanel } from "@/components/employer/EmployerSubscriptionPanel";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
}

interface EmployerDashboardTabsProps {
  businessData: BusinessData | null;
  defaultTab?: string;
  openJobId?: string;
}

export function EmployerDashboardTabs({ businessData, defaultTab, openJobId }: EmployerDashboardTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { canManageOrgSettings } = useOrgPermissions();
  const [activeTab, setActiveTab] = useState(defaultTab || "overview");
  
  useEffect(() => {
    if (tabsRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.from(tabsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, []);


  
  return (
    <div ref={tabsRef}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex w-full h-auto flex-wrap justify-start gap-1 rounded-none border-b border-border bg-background px-0 pb-3">
          <TabsTrigger value="overview" className="min-h-11 flex items-center gap-1.5 transition-colors hover:bg-accent">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="min-h-11 flex items-center gap-1.5 transition-colors hover:bg-accent">
            <FileText className="h-4 w-4" />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="min-h-11 flex items-center gap-1.5 transition-colors hover:bg-accent">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="subscription" className="min-h-11 flex items-center gap-1.5 transition-colors hover:bg-accent">
            <CreditCard className="h-4 w-4" />
            Plan
          </TabsTrigger>
          {canManageOrgSettings && (
            <TabsTrigger 
              value="settings" 
              className="min-h-11 flex items-center gap-1.5 transition-colors hover:bg-accent"
              onClick={() => navigate('/organization/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <EmployerOverviewTab businessData={businessData} onTabChange={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="jobs" className="pt-4 animate-fade-in">
          <JobManagementTab openJobId={openJobId} />
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-4 animate-fade-in">
          <EmployerAnalyticsTab />
        </TabsContent>

        <TabsContent value="subscription" className="pt-4 animate-fade-in">
          <EmployerSubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
