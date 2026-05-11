import { PortalRail } from "./PortalRail";
import { PortalContextPanel } from "./PortalContextPanel";
import { WelcomeStrip } from "./welcome/WelcomeStrip";
import { TodaysFocus } from "./focus/TodaysFocus";
import { PortalDistricts } from "./tiles/PortalDistricts";
import { ActivityStream } from "./activity/ActivityStream";
import { PortalMessagesCard } from "./messages/PortalMessagesCard";
import { useDashboardPanel } from "./useDashboardPanel";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileCompletionCard } from "@/components/profile/ProfileCompletionCard";
import { BrandImageSlot } from "./decor/BrandImageSlot";

interface PortalShellProps {
  userName: string;
  role: string;
  goal: string;
  insight?: string;
  openAIPlan?: boolean;
}

export function PortalShell({ userName, role, goal, insight, openAIPlan }: PortalShellProps) {
  const { openPanel } = useDashboardPanel();
  const { user } = useAuth();
  const completion = useProfileCompletion(user?.id);
  const completeness = completion.loading ? null : completion.score;

  return (
    <div className="flex w-full min-h-screen bg-[rgba(253,248,242,1)]">
      <PortalRail />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10 xl:px-14 pb-24">
            {/* Zone A — Welcome (full bleed) */}
            <WelcomeStrip userName={userName} insight={insight} completeness={completeness} />

            {/* SLOT 1 — Hero ribbon: humanize the greeting */}
            <div className="mt-7">
              <BrandImageSlot
                aspect="wide"
                placement="image-right"
                tone="cream"
                eyebrow="People of Lansa"
                headline="Your story belongs on the shortlist."
                body="Real people. Verified profiles. Real opportunities — built in Curaçao."
              />
            </div>

            {/* Profile completion engine — only renders when incomplete */}
            <div className="mt-6">
              <ProfileCompletionCard />
            </div>

            {/* Zone B — Asymmetric 2-column workspace */}
            <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
              {/* LEFT — strategic working surface */}
              <div className="lg:col-span-7 min-w-0 order-2 lg:order-1">
                <PortalDistricts autoOpenCareer={openAIPlan} />

                {/* SLOT 2 — Mid-rail editorial moment (desktop only) */}
                <div className="mt-8">
                  <BrandImageSlot
                    aspect="wide"
                    placement="image-top"
                    tone="ink"
                    priority="desktop-only"
                    eyebrow="From the island"
                    headline="Talent rooted here, recognized everywhere."
                    body="A short editorial line goes here — a story, a testimonial, a moment that reminds the user this platform is about people."
                  />
                </div>
              </div>

              {/* RIGHT — momentum: action + signal */}
              <div className="lg:col-span-5 min-w-0 order-1 lg:order-2 space-y-8">
                <TodaysFocus role={role} />

                {/* SLOT 3 — Momentum nudge */}
                <BrandImageSlot
                  aspect="square"
                  placement="image-top"
                  tone="accent"
                  eyebrow="Keep going"
                  headline="One step today. One door tomorrow."
                />

                <PortalMessagesCard />

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

            {/* SLOT 4 — Closing brand band */}
            <div className="mt-10">
              <BrandImageSlot
                aspect="wide"
                placement="image-left"
                tone="cream"
                eyebrow="Built in Curaçao"
                headline="A community-first way to be seen for who you are."
                body="Lansa is built around real verified people — so opportunity finds substance, not noise."
              />
            </div>
          </div>
        </main>
      </div>

      <PortalContextPanel role={role} goal={goal} />
    </div>
  );
}