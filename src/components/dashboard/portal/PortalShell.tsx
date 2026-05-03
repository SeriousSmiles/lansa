import { useEffect, useState } from "react";
import { PortalRail } from "./PortalRail";
import { PortalContextPanel } from "./PortalContextPanel";
import { WelcomeStrip } from "./welcome/WelcomeStrip";
import { TodaysFocus } from "./focus/TodaysFocus";
import { PortalDistricts } from "./tiles/PortalDistricts";
import { ActivityStream } from "./activity/ActivityStream";
import { PortalMessagesCard } from "./messages/PortalMessagesCard";
import { useDashboardPanel } from "./useDashboardPanel";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { supabase } from "@/integrations/supabase/client";

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
  const [completeness, setCompleteness] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("name,title,about_text,profile_image,skills,experiences,education")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted || !profile) return;
      const checks = [
        !!profile.name,
        !!profile.title,
        !!profile.about_text,
        !!profile.profile_image,
        Array.isArray(profile.skills) && profile.skills.length > 0,
        Array.isArray(profile.experiences) && profile.experiences.length > 0,
        Array.isArray(profile.education) && profile.education.length > 0,
      ];
      setCompleteness(
        Math.round((checks.filter(Boolean).length / checks.length) * 100)
      );
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <div className="flex w-full min-h-screen bg-[rgba(253,248,242,1)]">
      <PortalRail />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10 xl:px-14 pb-24">
            {/* Zone A — Welcome (full bleed) */}
            <WelcomeStrip userName={userName} insight={insight} completeness={completeness} />

            {/* Zone B — Asymmetric 2-column workspace */}
            <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
              {/* LEFT — strategic working surface */}
              <div className="lg:col-span-7 min-w-0 order-2 lg:order-1">
                <PortalDistricts autoOpenCareer={openAIPlan} />
              </div>

              {/* RIGHT — momentum: action + signal */}
              <div className="lg:col-span-5 min-w-0 order-1 lg:order-2 space-y-8">
                <TodaysFocus role={role} />

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
          </div>
        </main>
      </div>

      <PortalContextPanel role={role} goal={goal} />
    </div>
  );
}