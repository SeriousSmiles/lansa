import { useEffect, useState } from "react";
import { Sparkles, Eye, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
      const likes = (swipes || []).filter((s: any) => s.direction === "right").length;
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

  const counts: Record<DistrictKey, string | null> = {
    career: null,
    visibility: signals.interestedCount > 0 ? `${signals.interestedCount}` : null,
    performance: loaded && signals.isVisible ? `${signals.matchRate}%` : null,
    certification: signals.isCertified ? "✓" : null,
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
          Your portal
        </h2>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-[0_1px_0_hsl(0_0%_0%/0.04),0_12px_32px_-20px_hsl(14_90%_60%/0.22)] overflow-hidden">
        {/* Switcher */}
        <div className="flex items-center gap-1 p-1.5 border-b border-border/40 bg-background/40">
          {DISTRICTS.map((d) => {
            const isActive = active === d.key;
            const badge = counts[d.key];
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setActive(d.key)}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <d.icon className="h-3.5 w-3.5" />
                <span className="truncate">{d.label}</span>
                {badge && (
                  <span
                    className={cn(
                      "ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold tabular-nums",
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className="p-5 md:p-6">
          {active === "career" && (
            <div className="-mx-1">
              <AICareerPlanCard autoOpen={autoOpenCareer} />
            </div>
          )}

          {active === "visibility" && (
            <div className="space-y-4 -mx-1">
              <ListingActivationCard />
              <WhoIsInterestedSection />
            </div>
          )}

          {active === "performance" && (
            <PerformancePanel
              signals={signals}
              loaded={loaded}
              onDetails={() => openPanel("insights")}
            />
          )}

          {active === "certification" && (
            <div className="-mx-1">
              <CertificationCard />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PerformancePanel({
  signals,
  loaded,
  onDetails,
}: {
  signals: DistrictSignals;
  loaded: boolean;
  onDetails: () => void;
}) {
  if (!loaded) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/40" />;
  }
  if (!signals.isCertified) {
    return (
      <div className="text-sm text-muted-foreground">
        Pass the Lansa certification to unlock visibility analytics.
      </div>
    );
  }
  if (!signals.isVisible) {
    return (
      <div className="text-sm text-muted-foreground">
        Activate your listing to start seeing employer engagement.
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-extralight tracking-tight tabular-nums text-foreground">
            {signals.matchRate}
          </span>
          <span className="text-2xl font-light text-muted-foreground">%</span>
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            match rate
          </span>
        </div>
        <button
          type="button"
          onClick={onDetails}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Details →
        </button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Views", value: signals.views },
          { label: "Likes", value: signals.likes },
          { label: "Matches", value: signals.matches },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-accent/40 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
              {s.label}
            </div>
            <div className="text-lg font-semibold text-foreground tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}