import React, { useMemo } from "react";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useDashboardPanel } from "../useDashboardPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function PortalMessagesCard() {
  const { user } = useAuth();
  const { threads, loading, clearUnread } = useChatThreads();
  const { openPanel } = useDashboardPanel();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const openInbox = () => (isMobile ? navigate("/chat") : openPanel("inbox"));
  const openThread = (id: string) => {
    clearUnread(id);
    if (isMobile) navigate(`/chat/${id}`);
    else openPanel("inbox", { threadId: id });
  };

  const top = useMemo(() => threads.slice(0, 3), [threads]);
  const totalUnread = useMemo(
    () => threads.reduce((sum, t) => sum + (t.unread_count ?? 0), 0),
    [threads]
  );

  if (!user) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium flex items-center gap-2">
          Messages
          {totalUnread > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={openInbox}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </button>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm overflow-hidden">
        {loading && top.length === 0 ? (
          <div className="p-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : top.length === 0 ? (
          <button
            type="button"
            onClick={openInbox}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-accent/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-muted/80 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground/80">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect with employers to start chatting.
              </p>
            </div>
          </button>
        ) : (
          <ul className="divide-y divide-border/30">
            {top.map((t) => {
              const other = t.other_party;
              const name = other?.name ?? "Unknown";
              const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const isEmployer = !!other?.organization_name;
              const avatarSrc =
                (isEmployer && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined);
              const hasUnread = (t.unread_count ?? 0) > 0;
              const timeAgo = t.last_message_at
                ? formatDistanceToNow(new Date(t.last_message_at), { addSuffix: false })
                : "";
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openThread(t.id)}
                    className="group w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={avatarSrc} alt={name} />
                        <AvatarFallback
                          className="text-xs font-bold text-white"
                          style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={cn(
                            "text-sm truncate",
                            hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/85"
                          )}
                        >
                          {name}
                        </span>
                        <span className="text-[11px] text-muted-foreground/70 flex-shrink-0">
                          {timeAgo}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs truncate",
                          hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"
                        )}
                      >
                        {t.last_message ?? "Start the conversation"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}