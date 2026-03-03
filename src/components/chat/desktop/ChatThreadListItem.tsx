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

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border/40",
        isActive && "bg-muted"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-11 h-11">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {(thread.unread_count ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[9px] text-white font-bold">
            {thread.unread_count! > 9 ? "9+" : thread.unread_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "text-sm font-semibold truncate",
            (thread.unread_count ?? 0) > 0 ? "text-foreground" : "text-foreground/80"
          )}>
            {name}
          </span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{timeAgo}</span>
        </div>
        {other?.organization_name && (
          <p className="text-xs text-primary/70 font-medium truncate mb-0.5">
            {other.organization_name}
          </p>
        )}
        <p className={cn(
          "text-xs truncate",
          (thread.unread_count ?? 0) > 0 ? "text-foreground font-medium" : "text-muted-foreground"
        )}>
          {thread.last_message ?? "Start the conversation"}
        </p>
      </div>
    </button>
  );
}
