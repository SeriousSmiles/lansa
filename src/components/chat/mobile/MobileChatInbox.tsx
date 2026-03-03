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

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left border-b border-border/40 hover:bg-muted/40 transition-colors active:bg-muted"
      style={{ minHeight: 72 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src={(isEmployer && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined)} alt={name} />
          <AvatarFallback
            className="text-sm font-semibold text-white"
            style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn("text-base font-semibold truncate", !hasUnread && "font-medium text-foreground/90")}>
            {name}
          </span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{timeAgo}</span>
        </div>
        {other?.organization_name && (
          <p className="text-xs text-[#2B7FE8] font-medium truncate mb-0.5">{other.organization_name}</p>
        )}
        <p className={cn(
          "text-sm truncate",
          hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
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
  const { threads, loading } = useChatThreads();
  const { userType } = useUserState();
  const navigate = useNavigate();

  if (!user) return null;

  // If a thread is active on mobile → show the thread view full screen
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
      <div className="px-4 pt-safe-top pb-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {userType === 'employer' && (
            <button
              onClick={() => navigate('/employer-dashboard')}
              className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            {!loading && threads.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {threads.length} conversation{threads.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thread List */}
      {loading ? (
        <div className="space-y-px">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border/40 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/5" />
                <div className="h-3 bg-muted rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Chats open after you and another person both connect. Browse candidates or check your notifications.
          </p>
        </div>
      ) : (
        <div>
          {threads.map(thread => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              currentUserId={user.id}
              onSelect={() => onSelectThread(thread.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
