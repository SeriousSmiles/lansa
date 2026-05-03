import { PortalRail } from "./PortalRail";
import { PortalContextPanel } from "./PortalContextPanel";
import { WelcomeStrip } from "./welcome/WelcomeStrip";
import { StatusRibbon } from "./welcome/StatusRibbon";
import { TodaysFocus } from "./focus/TodaysFocus";
import { CareerPlanTile } from "./tiles/CareerPlanTile";
import { PerformanceTile } from "./tiles/PerformanceTile";
import { VisibilityTile } from "./tiles/VisibilityTile";
import { CertificationTile } from "./tiles/CertificationTile";
import { ActivityStream } from "./activity/ActivityStream";
import { useDashboardPanel } from "./useDashboardPanel";

interface PortalShellProps {
  userName: string;
  role: string;
  goal: string;
  insight?: string;
  openAIPlan?: boolean;
}

export function PortalShell({ userName, role, goal, insight, openAIPlan }: PortalShellProps) {
  const { openPanel } = useDashboardPanel();

  return (
    <div className="flex w-full min-h-screen bg-[rgba(253,248,242,1)]">
      <PortalRail />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1040px] px-5 sm:px-8 lg:px-12 pb-24">
            <WelcomeStrip userName={userName} insight={insight} />
            <StatusRibbon />
            <TodaysFocus role={role} />

            {/* Portal grid */}
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Your portal
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <CareerPlanTile autoOpen={openAIPlan} />
                <VisibilityTile />
                <PerformanceTile />
                <CertificationTile />
              </div>
            </section>

            {/* Activity stream */}
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Recent activity
                </h2>
                <button
                  type="button"
                  onClick={() => openPanel("activity")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm p-3 md:p-4">
                <ActivityStream limit={5} />
              </div>
            </section>
          </div>
        </main>
      </div>

      <PortalContextPanel role={role} goal={goal} />
    </div>
  );
}