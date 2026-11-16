import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Briefcase, FileText, ShieldCheck, UserRound } from "lucide-react";
import { PortalRail } from "./PortalRail";
import { PortalContextPanel } from "./PortalContextPanel";
import { WelcomeStrip } from "./welcome/WelcomeStrip";
import { PortalDistricts } from "./tiles/PortalDistricts";
import { ActivityStream } from "./activity/ActivityStream";
import { PortalMessagesCard } from "./messages/PortalMessagesCard";
import { useDashboardPanel } from "./useDashboardPanel";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DashboardActionBand } from "../DashboardActionBand";

interface PortalShellProps {
  userName: string;
  role: string;
  goal: string;
  insight?: string;
  openAIPlan?: boolean;
}

export function PortalShell({ userName, role, goal, openAIPlan }: PortalShellProps) {
  const { openPanel } = useDashboardPanel();
  const { user } = useAuth();
  const navigate = useNavigate();
  const completion = useProfileCompletion(user?.id);
  const [certified, setCertified] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase.from("user_certifications").select("lansa_certified,verified").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (active) setCertified(Boolean(data?.lansa_certified && data?.verified));
    });
    return () => { active = false; };
  }, [user?.id]);
  const nextStep = completion.missing_steps[0];
  const profileNeedsWork = !completion.is_complete && Boolean(nextStep);
  const loading = completion.loading || certified === null;

  return (
    <div className="flex w-full min-h-screen bg-background">
      <PortalRail />
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 pb-24">
        <WelcomeStrip userName={userName} completeness={completion.loading ? null : completion.score} />
        <DashboardActionBand
          label="Your next step"
          title={loading ? "Getting your workspace ready" : profileNeedsWork ? nextStep?.label || "Complete your profile" : !certified ? "Let employers see your potential" : "Find your next opportunity"}
          description={loading ? "Your progress will appear here shortly." : profileNeedsWork ? "Bring your experience into focus, one step at a time." : !certified ? "Explore a sector certification and take the next step toward employer discovery." : "Explore open roles and keep the opportunities that feel right for you."}
          actionLabel={profileNeedsWork ? "Continue my profile" : !certified ? "Explore certification" : "Explore jobs"}
          icon={profileNeedsWork ? UserRound : !certified ? ShieldCheck : Briefcase}
          loading={loading}
          onAction={() => navigate(profileNeedsWork ? nextStep?.cta_route || "/profile" : !certified ? "/certification" : "/jobs")}
        />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="min-w-0 lg:col-span-7 space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Your opportunities</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>View jobs<ArrowUpRight className="ml-1 h-4 w-4" /></Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Explore jobs", detail: "Find a role that fits your next chapter.", icon: Briefcase, path: "/jobs" },
                  { label: "My profile", detail: "Show the experience behind your story.", icon: UserRound, path: "/profile" },
                ].map(item => <Button key={item.label} variant="outline" className="h-auto min-h-28 justify-start whitespace-normal p-5 text-left gap-3 rounded-lg" onClick={() => navigate(item.path)}>
                  <item.icon className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-base font-semibold">{item.label}</span><span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{item.detail}</span></span>
                </Button>)}
              </div>
            </section>
            <PortalDistricts autoOpenCareer={openAIPlan} />
          </div>
          <aside className="min-w-0 lg:col-span-5 space-y-8">
            <PortalMessagesCard />
            <section>
              <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Recent activity</h2><Button variant="ghost" size="sm" onClick={() => openPanel("activity")}>View all<ArrowUpRight className="ml-1 h-4 w-4" /></Button></div>
              <ActivityStream limit={3} />
            </section>
            <section className="border-t border-border pt-5">
              <h2 className="text-lg font-bold mb-2">Make it yours</h2>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigate("/profile/resume-editor")}><FileText className="mr-2 h-4 w-4" />My resume</Button><Button variant="ghost" onClick={() => navigate("/profile")}><UserRound className="mr-2 h-4 w-4" />My profile</Button></div>
            </section>
          </aside>
        </div>
      </div>
      <PortalContextPanel role={role} goal={goal} />
    </div>
  );
}
