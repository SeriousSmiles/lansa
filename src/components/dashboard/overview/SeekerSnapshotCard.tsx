import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Compact replacement for the old StudentAnalyticsCard side panel.
 * Surfaces only the two pieces of info that actually had value: the
 * Lansa Certified badge and the count of nudges the seeker received.
 */
export function SeekerSnapshotCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certified, setCertified] = useState(false);
  const [nudges, setNudges] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const [certRes, swipeRes] = await Promise.all([
          supabase
            .from("user_certifications")
            .select("lansa_certified")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("swipes")
            .select("id", { count: "exact", head: true })
            .eq("target_user_id", user.id)
            .eq("direction", "nudge"),
        ]);

        if (cancelled) return;
        setCertified(!!certRes.data?.lansa_certified);
        setNudges(swipeRes.count ?? 0);
      } catch (err) {
        console.error("[SeekerSnapshotCard]", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">{nudges}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Nudge{nudges === 1 ? "" : "s"} received
            </p>
          </div>
        </div>

        {certified ? (
          <img
            src="/lovable-uploads/62496478-1e20-484c-bb96-6f47496037df.png"
            alt="Lansa Certified"
            className="h-10 w-auto flex-shrink-0"
          />
        ) : (
          <Badge variant="outline" className="flex-shrink-0 gap-1">
            <Award className="h-3 w-3" />
            Not certified
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}