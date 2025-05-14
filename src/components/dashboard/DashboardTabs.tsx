
import { LockKeyhole } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./DashboardOverview";
import { StoryBuilder } from "./StoryBuilder";

type DashboardTabsProps = {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
};

export function DashboardTabs({
  userName,
  role,
  goal,
  insight,
  highlightActions
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="mb-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="storybuilder" className="flex items-center gap-1.5">
          <span>Story Builder</span>
          <LockKeyhole className="h-3.5 w-3.5" />
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <DashboardOverview 
          userName={userName} 
          role={role} 
          goal={goal} 
          insight={insight}
          highlightActions={highlightActions}
        />
      </TabsContent>
      
      <TabsContent value="storybuilder">
        <StoryBuilder />
      </TabsContent>
    </Tabs>
  );
}
