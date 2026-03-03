import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChatThreads } from "@/hooks/useChatThreads";
import { MobileChatThread } from "./MobileChatThread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/services/chatService";
import { useUserState } from "@/contexts/UserStateProvider";
import { useNavigate } from "react-router-dom";

interface MobileChatInboxProps {
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onBack: () => void;
}

function ThreadRow({
  thread,
  currentUserId,
  onSelect,
}: {
  thread: ChatThread;
  currentUserId: string;
  onSelect: () => void;
}) {
  const other = thread.other_party;
  const name = other?.name ?? "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const timeAgo = thread.last_message_at
    ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: false })
    : "";
  const hasUnread = (thread.unread_count ?? 0) > 0;
  const isEmployer = !!other?.organization_name;
  const avatarSrc = (isEmployer && other?.organization_logo)
    ? other.organization_logo
    : (other?.profile_image ?? undefined);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-muted/60",
        hasUnread ? "bg-primary/5" : ""
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#F2713B] rounded-full border-2 border-background" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn(
            "text-[15px] truncate",
            hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/85"
          )}>
            {name}
          </span>
          <span className={cn(
            "text-[11px] flex-shrink-0 whitespace-nowrap",
            hasUnread ? "text-[#F2713B] font-medium" : "text-muted-foreground/60"
          )}>
            {timeAgo}
          </span>
        </div>
        {other?.organization_name && (
          <p className="text-xs font-semibold truncate mb-0.5" style={{ color: "#2B7FE8" }}>
            {other.organization_name}
          </p>
        )}
        <p className={cn(
          "text-sm truncate",
          hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground/60"
        )}>
          {thread.last_message ?? "Tap to start chatting"}
        </p>
      </div>
    </button>
  );
}

export function MobileChatInbox({
  activeThreadId,
  onSelectThread,
  onBack,
}: MobileChatInboxProps) {
  const { user } = useAuth();
  const { threads, loading, clearUnread } = useChatThreads();
  const { userType } = useUserState();
  const navigate = useNavigate();

  if (!user) return null;

  if (activeThreadId) {
    return (
      <MobileChatThread
        key={activeThreadId}
        threadId={activeThreadId}
        currentUserId={user.id}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-safe-top pb-4 bg-card/90 backdrop-blur-md sticky top-0 z-10 border-b border-border/40">
        <div className="flex items-center gap-2">
          {userType === 'employer' && (
            <button
              onClick={() => navigate('/employer-dashboard')}
              className="p-2 -ml-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Messages</h1>
            {!loading && threads.length > 0 && (
              <p className="text-xs text-muted-foreground/60">
                {threads.length} conversation{threads.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 divide-y divide-border/30">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-8 py-24">
            <div className="w-20 h-20 rounded-3xl bg-muted/70 flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold text-foreground/80 mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs">
              Chats open after you and another person both connect.
            </p>
          </div>
        ) : (
          threads.map(thread => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              currentUserId={user.id}
              onSelect={() => { clearUnread(thread.id); onSelectThread(thread.id); }}
            />
          ))
        )}
      </div>
    </div>
  );
}
