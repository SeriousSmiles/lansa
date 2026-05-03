import { TrendingUp, ArrowUpRight } from "lucide-react";
import { TileShell } from "./TileShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useDashboardPanel } from "../useDashboardPanel";

interface Stats {
  views: number;
  likes: number;
  matches: number;
  matchRate: number;
  isCertified: boolean;
  isVisible: boolean;
}

export function PerformanceTile() {
  const { user } = useAuth();
  const { openPanel } = useDashboardPanel();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const [{ data: cert }, { data: profile }, { data: swipes }, { data: matches }] = await Promise.all([
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
      const matchRate = total > 0 ? Math.round((matchCount / total) * 100) : 0;
      setStats({
        views: total,
        likes,
        matches: matchCount,
        matchRate,
        isCertified: !!(cert?.lansa_certified && cert?.verified),
        isVisible: !!profile?.visible_to_employers,
      });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <TileShell
      label="Insights"
      title="Performance"
      icon={TrendingUp}
      onOpen={() => openPanel("insights")}
      openLabel="Details"
    >
      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
      ) : !stats?.isCertified ? (
        <div className="text-sm text-muted-foreground">
          Pass the Lansa certification to unlock visibility analytics.
        </div>
      ) : !stats.isVisible ? (
        <div className="text-sm text-muted-foreground">
          Activate your listing to start seeing employer engagement.
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extralight tracking-tight tabular-nums text-foreground">
              {stats.matchRate}
            </span>
            <span className="text-2xl font-light text-muted-foreground">%</span>
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              match rate
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Views", value: stats.views },
              { label: "Likes", value: stats.likes },
              { label: "Matches", value: stats.matches },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-accent/40 px-3 py-2.5"
              >
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
      )}
    </TileShell>
  );
}