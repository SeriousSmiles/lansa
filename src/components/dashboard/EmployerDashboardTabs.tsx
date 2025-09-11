import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, BarChart3 } from "lucide-react";
import { gsap } from "gsap";
import { EmployerOverviewTab } from "./employer/EmployerOverviewTab";
import { JobManagementTab } from "./employer/JobManagementTab";
import { EmployerAnalyticsTab } from "./employer/EmployerAnalyticsTab";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
}

interface EmployerDashboardTabsProps {
  businessData: BusinessData | null;
}

export function EmployerDashboardTabs({ businessData }: EmployerDashboardTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tabsRef.current) {
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
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 transition-colors hover:bg-muted">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-1.5 transition-colors hover:bg-muted">
            <FileText className="h-4 w-4" />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 transition-colors hover:bg-muted">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <EmployerOverviewTab businessData={businessData} />
        </TabsContent>
        
        <TabsContent value="jobs" className="pt-4 animate-fade-in">
          <JobManagementTab />
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-4 animate-fade-in">
          <EmployerAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}