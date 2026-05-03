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
          <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10 xl:px-14 pb-24">
            {/* Zone A — Welcome (full bleed) */}
            <WelcomeStrip userName={userName} insight={insight} />

            {/* Zone B — Asymmetric 2-column workspace */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
              {/* LEFT — strategic working surface */}
              <div className="lg:col-span-7 min-w-0 order-2 lg:order-1 space-y-8">
                <StatusRibbon />

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                      Your portal
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <CareerPlanTile autoOpen={openAIPlan} />
                    <VisibilityTile />
                    <PerformanceTile />
                    <CertificationTile />
                  </div>
                </section>
              </div>

              {/* RIGHT — momentum: action + signal */}
              <div className="lg:col-span-5 min-w-0 order-1 lg:order-2 space-y-8">
                <TodaysFocus role={role} />

                <section>
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
            </div>
          </div>
        </main>
      </div>

      <PortalContextPanel role={role} goal={goal} />
    </div>
  );
}