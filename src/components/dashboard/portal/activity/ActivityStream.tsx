import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Bell, Sparkles, Heart, ShieldCheck, Briefcase, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  action_url?: string | null;
  created_at: string;
}

function iconFor(type: string) {
  if (type.includes("match")) return Heart;
  if (type.includes("certif")) return ShieldCheck;
  if (type.includes("job") || type.includes("application")) return Briefcase;
  if (type.includes("chat") || type.includes("message")) return MessageCircle;
  if (type.includes("insight") || type.includes("ai")) return Sparkles;
  return Bell;
}

export function ActivityStream({ limit = 5 }: { limit?: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("notifications")
        .select("id,type,title,message,action_url,created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (mounted) {
        setItems((data || []) as ActivityItem[]);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-8 text-center">
        <Bell className="mx-auto h-6 w-6 text-muted-foreground/60" />
        <p className="mt-3 text-sm text-muted-foreground">
          No recent activity yet. Updates from matches, applications and insights will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = iconFor(item.type);
        const clickable = !!item.action_url;
        return (
          <li key={item.id}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && navigate(item.action_url!)}
              className="w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent/60 disabled:hover:bg-transparent"
            >
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </div>
                {item.message && (
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.message}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}