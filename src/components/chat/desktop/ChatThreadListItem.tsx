import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { ChatThread } from "@/services/chatService";
import { cn } from "@/lib/utils";

interface ChatThreadListItemProps {
  thread: ChatThread;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ChatThreadListItem({
  thread,
  isActive,
  currentUserId,
  onClick,
}: ChatThreadListItemProps) {
  const other = thread.other_party;
  const name = other?.name ?? "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isEmployer = !!other?.organization_name;
  const avatarSrc = (isEmployer && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined);
  const timeAgo = thread.last_message_at
    ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: false })
    : "";
  const hasUnread = (thread.unread_count ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 px-4 py-4 text-left transition-all duration-150 border-b border-border/30",
        isActive
          ? "bg-primary/8 border-l-2 border-l-primary"
          : "hover:bg-muted/50 border-l-2 border-l-transparent"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-11 h-11 ring-1 ring-border/40">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[9px] text-white font-bold border-2 border-background">
            {thread.unread_count! > 9 ? "9+" : thread.unread_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "text-sm truncate",
            hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/85"
          )}>
            {name}
          </span>
          <span className="text-[11px] text-muted-foreground/70 ml-2 flex-shrink-0">{timeAgo}</span>
        </div>
        {other?.organization_name && (
          <p className="text-xs font-medium truncate mb-0.5" style={{ color: "#2B7FE8" }}>
            {other.organization_name}
          </p>
        )}
        <p className={cn(
          "text-xs truncate leading-relaxed",
          hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"
        )}>
          {thread.last_message ?? "Start the conversation"}
        </p>
      </div>
    </button>
  );
}
