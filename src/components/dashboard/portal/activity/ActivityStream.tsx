import { useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Bell, Sparkles, Heart, ShieldCheck, Briefcase, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      try {
        const data = await notificationService.getRecentNotifications(user.id, since, limit);
        if (mounted) setItems(data);
      } catch (error) {
        console.error('Recent activity could not load:', error);
      } finally {
        if (mounted) setLoading(false);
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
      <div className="border-y border-border bg-dashboard-blue-surface/50 px-5 py-6 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10"><Bell className="h-5 w-5 text-dashboard-blue-text" /></span>
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
            <Button
              variant="ghost"
              type="button"
              disabled={!clickable}
              onClick={() => { if (item.action_url) navigate(item.action_url); }}
              className="w-full h-auto whitespace-normal justify-start flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/60 disabled:opacity-100 disabled:hover:bg-transparent"
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
            </Button>
          </li>
        );
      })}
    </ul>
  );
}