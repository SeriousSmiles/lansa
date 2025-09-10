
import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { gsap } from "gsap";
import { OverviewTab } from "./overview/OverviewTab";
import { StoryBuilderTab } from "./StoryBuilderTab";
import { AICoachTab } from "./AICoachTab";

interface DashboardTabsProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading: boolean;
}

export function DashboardTabs({
  userName,
  role,
  goal,
  insight,
  highlightActions,
  isLoading
}: DashboardTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  
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
  
  return (
    <div ref={tabsRef}>
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview" className="btn-animate">Overview</TabsTrigger>
          <TabsTrigger value="storybuilder" className="flex items-center gap-1.5 btn-animate">
            <span>Story Builder</span>
            <Badge variant="default" className="text-xs px-1.5 py-0.5">Beta</Badge>
          </TabsTrigger>
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
        
        <TabsContent value="storybuilder" className="pt-4 animate-fade-in">
          <StoryBuilderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
