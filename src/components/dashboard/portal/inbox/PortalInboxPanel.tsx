import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useChat } from "@/hooks/useChat";
import { chatService } from "@/services/chatService";
import { ChatThreadListItem } from "@/components/chat/desktop/ChatThreadListItem";
import { MessageBubble } from "@/components/chat/desktop/MessageBubble";
import { ChatInput } from "@/components/chat/shared/ChatInput";
import { useDashboardPanel } from "../useDashboardPanel";
import { cn } from "@/lib/utils";

function ThreadView({ threadId, onBack }: { threadId: string; onBack: () => void }) {
  const { user } = useAuth();
  const { messages, thread, sending, sendMessage } = useChat(threadId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    chatService.markThreadRead(threadId).catch(() => {});
  }, [threadId]);

  const other = thread?.other_party;
  const otherName = other?.name ?? "Conversation";
  const initials = otherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isEmployer = !!other?.organization_name;
  const avatarSrc = (isEmployer && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined);

  const showSenderInfo = (i: number) =>
    i === 0 || messages[i].sender_id !== messages[i - 1].sender_id;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-card/60">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarImage src={avatarSrc} alt={otherName} />
          <AvatarFallback
            className="text-xs font-bold text-white"
            style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{otherName}</p>
          {other?.organization_name && (
            <p className="text-[11px] text-muted-foreground truncate">{other.organization_name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(`/chat/${threadId}`)}
          className="p-1.5 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open full thread"
          title="Open full thread"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground/70">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Say hello to get things going.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isSelf={msg.sender_id === user?.id}
                  senderName={otherName}
                  senderImage={avatarSrc}
                  senderOrgName={other?.organization_name ?? undefined}
                  showSenderInfo={showSenderInfo(i)}
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="px-3 py-3 border-t border-border/40 bg-card/60">
        <ChatInput
          onSend={(body) => sendMessage(body)}
          disabled={sending}
          placeholder={`Message ${otherName}…`}
        />
      </div>
    </div>
  );
}

export function PortalInboxPanel() {
  const { user } = useAuth();
  const { threads, loading, clearUnread } = useChatThreads();
  const { inboxThreadId, setInboxThread } = useDashboardPanel();
  const navigate = useNavigate();

  const totalUnread = useMemo(
    () => threads.reduce((sum, t) => sum + (t.unread_count ?? 0), 0),
    [threads]
  );

  if (!user) return null;

  if (inboxThreadId) {
    return <ThreadView threadId={inboxThreadId} onBack={() => setInboxThread(null)} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
          {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Open full inbox
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {loading && threads.length === 0 ? (
          <div className="px-4 py-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground/70">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs">
              Once you connect with employers or apply to a role, your conversations will appear here.
            </p>
          </div>
        ) : (
          <ul className={cn("divide-y divide-border/30")}> 
            {threads.map((t) => (
              <li key={t.id}>
                <ChatThreadListItem
                  thread={t}
                  isActive={false}
                  currentUserId={user.id}
                  onClick={() => {
                    clearUnread(t.id);
                    setInboxThread(t.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}