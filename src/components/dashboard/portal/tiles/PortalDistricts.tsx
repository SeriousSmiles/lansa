import { useEffect, useState } from "react";
import { Sparkles, Eye, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AICareerPlanCard } from "@/components/dashboard/overview/AICareerPlanCard";
import { ListingActivationCard } from "@/components/dashboard/overview/ListingActivationCard";
import { WhoIsInterestedSection } from "@/components/dashboard/WhoIsInterestedSection";
import { CertificationCard } from "@/components/dashboard/overview/CertificationCard";
import { useDashboardPanel } from "../useDashboardPanel";

type DistrictKey = "career" | "visibility" | "performance" | "certification";

interface DistrictMeta {
  key: DistrictKey;
  label: string;
  icon: React.ElementType;
}

const DISTRICTS: DistrictMeta[] = [
  { key: "career", label: "Career", icon: Sparkles },
  { key: "visibility", label: "Visibility", icon: Eye },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "certification", label: "Certification", icon: ShieldCheck },
];

interface DistrictSignals {
  interestedCount: number;
  isCertified: boolean;
  isVisible: boolean;
  matchRate: number;
  views: number;
  likes: number;
  matches: number;
}

interface PortalDistrictsProps {
  autoOpenCareer?: boolean;
}

export function PortalDistricts({ autoOpenCareer }: PortalDistrictsProps) {
  const { user } = useAuth();
  const { openPanel } = useDashboardPanel();
  const [active, setActive] = useState<DistrictKey>("career");
  const [signals, setSignals] = useState<DistrictSignals>({
    interestedCount: 0,
    isCertified: false,
    isVisible: false,
    matchRate: 0,
    views: 0,
    likes: 0,
    matches: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const [{ data: cert }, { data: profile }, { data: swipes }, { data: matches }] =
        await Promise.all([
          supabase
            .from("user_certifications")
            .select("lansa_certified,verified")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_profiles")
            .select("visible_to_employers")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("swipes")
            .select("direction")
            .eq("target_user_id", user.id),
          supabase
            .from("matches")
            .select("id")
            .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
        ]);
      if (!mounted) return;
      const total = swipes?.length || 0;
      const likes = (swipes || []).filter((s) => s.direction === "right").length;
      const matchCount = matches?.length || 0;
      setSignals({
        interestedCount: likes,
        isCertified: !!(cert?.lansa_certified && cert?.verified),
        isVisible: !!profile?.visible_to_employers,
        matchRate: total > 0 ? Math.round((matchCount / total) * 100) : 0,
        views: total,
        likes,
        matches: matchCount,
      });
      setLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <section className="space-y-5">
      <h2 className="dashboard-section-title text-lg font-bold">Your progress</h2>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setActive("visibility")} className="h-auto min-h-24 whitespace-normal justify-start text-left p-4 gap-3 border-primary/25 bg-card shadow-dashboard"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-dashboard-orange-text"><Eye className="h-5 w-5" /></span><span className="min-w-0"><span className="block font-semibold">Employer visibility</span><span className="block text-xs text-dashboard-orange-text mt-1">{!loaded ? "Loading…" : signals.isVisible && signals.isCertified ? "Profile is live" : "Not live yet"}</span></span></Button>
        <Button variant="outline" onClick={() => setActive("certification")} className="h-auto min-h-24 whitespace-normal justify-start text-left p-4 gap-3 border-secondary/25 bg-card shadow-dashboard"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-dashboard-blue-text"><ShieldCheck className="h-5 w-5" /></span><span className="min-w-0"><span className="block font-semibold">Certification</span><span className="block text-xs text-dashboard-blue-text mt-1">{!loaded ? "Loading…" : signals.isCertified ? "Certified & verified" : "Your next milestone"}</span></span></Button>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border pb-2" role="group" aria-label="Progress views">
        {DISTRICTS.map(d => <Button key={d.key} variant="ghost" size="sm" aria-pressed={active === d.key} onClick={() => setActive(d.key)} className={`min-h-11 gap-2 ${active === d.key ? "bg-dashboard-ink text-dashboard-on-ink hover:bg-dashboard-ink/90 hover:text-dashboard-on-ink" : "text-muted-foreground"}`}><d.icon className="h-4 w-4" />{d.label}</Button>)}
      </div>
      {active === "career" && <AICareerPlanCard autoOpen={autoOpenCareer} />}
      {active === "visibility" && <div className="space-y-4"><ListingActivationCard /><WhoIsInterestedSection /></div>}
      {active === "certification" && <CertificationCard />}
      {active === "performance" && <div>
        {!loaded ? <p className="text-sm text-muted-foreground">Loading your progress…</p> : !signals.isCertified || !signals.isVisible ? <p className="text-sm text-muted-foreground">Employer engagement is available once your certified profile is live.</p> : <div className="grid grid-cols-3 gap-4">{[{ label: "Views", value: signals.views }, { label: "Likes", value: signals.likes }, { label: "Matches", value: signals.matches }].map(item => <div key={item.label}><p className="text-2xl font-bold tabular-nums">{item.value}</p><p className="text-xs text-muted-foreground mt-1">{item.label}</p></div>)}</div>}
        <Button variant="ghost" className="mt-3" onClick={() => openPanel("insights")}>View insights<ArrowUpRight className="ml-2 h-4 w-4" /></Button>
      </div>}
    </section>
  );
}
