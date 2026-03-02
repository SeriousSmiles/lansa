import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Heart, ArrowRight, Loader2 } from "lucide-react";

interface InterestedEmployer {
  swipe_id: string;
  direction: string;
  created_at: string;
  employer_id: string;
  employer_name: string | null;
  employer_title: string | null;
  employer_image: string | null;
  employer_cover_color: string | null;
}

export function WhoIsInterestedSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interested, setInterested] = useState<InterestedEmployer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchInterestedEmployers();
  }, [user]);

  const fetchInterestedEmployers = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Get swipes where this candidate is the target (right or nudge)
      const { data: swipes, error } = await supabase
        .from("swipes")
        .select("id, direction, created_at, swiper_user_id")
        .eq("target_user_id", user.id)
        .in("direction", ["right", "nudge"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !swipes?.length) {
        setIsLoading(false);
        return;
      }

      // Filter out employers the candidate has already swiped back on
      const { data: mySwipes } = await supabase
        .from("swipes")
        .select("target_user_id")
        .eq("swiper_user_id", user.id)
        .in("target_user_id", swipes.map((s) => s.swiper_user_id));

      const alreadySwiped = new Set(mySwipes?.map((s) => s.target_user_id) ?? []);
      const pending = swipes.filter((s) => !alreadySwiped.has(s.swiper_user_id));

      if (!pending.length) {
        setIsLoading(false);
        return;
      }

      // Fetch employer profiles
      const employerIds = [...new Set(pending.map((s) => s.swiper_user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, name, title, profile_image, cover_color")
        .in("user_id", employerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      const result: InterestedEmployer[] = pending.map((swipe) => {
        const profile = profileMap.get(swipe.swiper_user_id);
        return {
          swipe_id: swipe.id,
          direction: swipe.direction,
          created_at: swipe.created_at,
          employer_id: swipe.swiper_user_id,
          employer_name: profile?.name ?? null,
          employer_title: profile?.title ?? null,
          employer_image: profile?.profile_image ?? null,
          employer_cover_color: profile?.cover_color ?? null,
        };
      });

      setInterested(result);
    } catch (err) {
      console.error("[WhoIsInterestedSection] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading interest...</span>
      </div>
    );
  }

  if (!interested.length) return null;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            👀 Who's Interested in You
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {interested.length} employer{interested.length !== 1 ? "s" : ""} expressed interest — swipe back to match
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary text-xs gap-1"
          onClick={() => navigate("/dashboard?tab=discover")}
        >
          Discover More <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
        {interested.map((employer) => (
          <div
            key={employer.swipe_id}
            className="flex-shrink-0 w-44 lg:w-auto bg-card border border-border rounded-xl overflow-hidden shadow-sm"
          >
            {/* Cover strip */}
            <div
              className="h-10 w-full"
              style={{
                background: employer.employer_cover_color
                  ? `linear-gradient(135deg, ${employer.employer_cover_color}cc 0%, ${employer.employer_cover_color}88 100%)`
                  : "hsl(var(--primary) / 0.15)",
              }}
            />

            <div className="px-3 pb-3 -mt-5">
              {/* Avatar */}
              {employer.employer_image ? (
                <img
                  src={employer.employer_image}
                  alt={employer.employer_name ?? "Employer"}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: employer.employer_cover_color ?? "hsl(var(--primary))",
                  }}
                >
                  {getInitials(employer.employer_name)}
                </div>
              )}

              <div className="mt-1.5 space-y-1">
                <p className="text-xs font-semibold text-foreground leading-tight truncate">
                  {employer.employer_name ?? "An Employer"}
                </p>
                {employer.employer_title && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {employer.employer_title}
                  </p>
                )}

                {/* Interest badge */}
                {employer.direction === "nudge" ? (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200 gap-0.5">
                    <Zap className="h-2.5 w-2.5" /> Super
                  </Badge>
                ) : (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700 border-green-200 gap-0.5">
                    <Heart className="h-2.5 w-2.5" /> Interested
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                className="w-full mt-2 h-7 text-xs"
                onClick={() => navigate("/dashboard?tab=discover")}
              >
                Swipe Back
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
