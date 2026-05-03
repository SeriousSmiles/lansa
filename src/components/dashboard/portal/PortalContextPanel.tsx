import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/overview/ProfileCard";
import { AICoachTab } from "@/components/dashboard/AICoachTab";
import { StudentAnalyticsCard } from "@/components/dashboard/overview/StudentAnalyticsCard";
import { useDashboardPanel, type PanelView } from "./useDashboardPanel";
import { ActivityStream } from "./ActivityStream";
import { X } from "lucide-react";

const TITLES: Record<PanelView, string> = {
  profile: "Your profile",
  ai: "AI Coach",
  insights: "Performance insights",
  activity: "Recent activity",
};

const SUBTITLES: Record<PanelView, string> = {
  profile: "How you appear to others",
  ai: "Personalized guidance, refreshed weekly",
  insights: "Visibility and engagement signals",
  activity: "What's happened in the last 14 days",
};

interface PortalContextPanelProps {
  role: string;
  goal: string;
}

export function PortalContextPanel({ role, goal }: PortalContextPanelProps) {
  const { open, view, close } = useDashboardPanel();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[440px] p-0 border-l border-border/40 bg-background flex flex-col gap-0"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/40">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight truncate">{TITLES[view]}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{SUBTITLES[view]}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="shrink-0 -mr-2 -mt-1"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {view === "profile" && <ProfileCard role={role} goal={goal} />}
          {view === "ai" && <AICoachTab />}
          {view === "insights" && <StudentAnalyticsCard />}
          {view === "activity" && <ActivityStream limit={20} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}