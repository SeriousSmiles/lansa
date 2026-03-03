import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, Heart, Loader2, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmployerInterestDrawer } from "./EmployerInterestDrawer";

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

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export function WhoIsInterestedSection() {
  const { user } = useAuth();
  const [interested, setInterested] = useState<InterestedEmployer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState<InterestedEmployer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchInterestedEmployers();
  }, [user]);

  const fetchInterestedEmployers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
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

      // Filter out employers already swiped back on
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

      const employerIds = [...new Set(pending.map((s) => s.swiper_user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, name, title, profile_image, cover_color")
        .in("user_id", employerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      setInterested(
        pending.map((swipe) => {
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
        })
      );
    } catch (err) {
      console.error("[WhoIsInterestedSection] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (employer: InterestedEmployer) => {
    setSelectedEmployer(employer);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading interest…</span>
      </div>
    );
  }

  if (!interested.length) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              Who's Interested in You
            </h3>
            <p className="text-xs text-muted-foreground">
              {interested.length} employer{interested.length !== 1 ? "s" : ""} expressed interest — review and connect
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {interested.map((employer) => {
            const isNudge = employer.direction === "nudge";
            return (
              <div
                key={employer.swipe_id}
              className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm flex items-stretch ${
                isNudge ? "border-l-amber-500" : "border-l-green-600"
              }`}
              style={{ borderLeftWidth: "3px" }}
              >
                <div className="flex items-center gap-3 flex-1 px-3 py-3">
                  {/* Avatar */}
                  {employer.employer_image ? (
                    <img
                      src={employer.employer_image}
                      alt={employer.employer_name ?? "Employer"}
                      className="w-10 h-10 rounded-xl border border-border object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: employer.employer_cover_color ?? "hsl(var(--primary))",
                      }}
                    >
                      {getInitials(employer.employer_name)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {employer.employer_name ?? "An Employer"}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(employer.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {employer.employer_title && (
                      <p className="text-xs text-muted-foreground truncate">{employer.employer_title}</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      {isNudge ? (
                        <>
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span className="text-[11px] text-amber-600 font-medium">Super Interested in you</span>
                        </>
                      ) : (
                        <>
                          <Heart className="h-3 w-3 text-green-600" />
                          <span className="text-[11px] text-green-700 font-medium">Liked your profile</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review CTA */}
                <div className="flex items-center pr-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold px-3 whitespace-nowrap"
                    onClick={() => handleReview(employer)}
                  >
                    Review →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EmployerInterestDrawer
        employer={selectedEmployer}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
