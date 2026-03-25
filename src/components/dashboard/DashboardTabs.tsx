
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { gsap } from "gsap";
import { OverviewTab } from "./overview/OverviewTab";
import { StoryBuilderTab } from "./StoryBuilderTab";
import { AICoachTab } from "./AICoachTab";
import { JobPreferencesTab } from "./JobPreferencesTab";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardTabsProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading: boolean;
  openAIPlan?: boolean;
}

export function DashboardTabs({
  userName,
  role,
  goal,
  insight,
  highlightActions,
  isLoading,
  openAIPlan
}: DashboardTabsProps) {
  const { user } = useAuth();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isCertified, setIsCertified] = useState(false);
  const [checkingCert, setCheckingCert] = useState(true);
  
  useEffect(() => {
    // Animate tabs when visible
    if (!isLoading && tabsRef.current) {
      gsap.from(tabsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isLoading]);

  useEffect(() => {
    checkCertification();
  }, [user?.id]);

  const checkCertification = async () => {
    if (!user?.id) {
      setCheckingCert(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_certifications')
        .select('lansa_certified, verified')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsCertified(data?.lansa_certified && data?.verified);
    } catch (error) {
      console.error('Error checking certification:', error);
    } finally {
      setCheckingCert(false);
    }
  };
  
  return (
    <div ref={tabsRef}>
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-card/50 border border-border/20 backdrop-blur-sm">
          <TabsTrigger 
            value="overview" 
            className="btn-animate data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground"
          >
            Overview
          </TabsTrigger>
          {/* Story Builder - Hidden until feature is complete */}
          {/* <TabsTrigger 
            value="storybuilder" 
            className="flex items-center gap-1.5 btn-animate data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground"
          >
            <span>Story Builder</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-0">Beta</Badge>
          </TabsTrigger> */}
          {!checkingCert && isCertified && (
            <TabsTrigger 
              value="preferences" 
              className="btn-animate data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground"
            >
              Job Preferences
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <OverviewTab
            userName={userName}
            role={role}
            goal={goal}
            insight={insight}
            highlightActions={highlightActions}
            isLoading={isLoading}
          />
        </TabsContent>
        
        {/* Story Builder Tab - Hidden until feature is complete */}
        {/* <TabsContent value="storybuilder" className="pt-4 animate-fade-in">
          <StoryBuilderTab />
        </TabsContent> */}
        
        {isCertified && (
          <TabsContent value="preferences" className="pt-4 animate-fade-in">
            <JobPreferencesTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
