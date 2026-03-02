import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/services/chatService";

interface MessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  senderName?: string;
  senderImage?: string;
  senderOrgName?: string;
  showSenderInfo?: boolean;
}

export function MessageBubble({
  message,
  isSelf,
  senderName,
  senderImage,
  senderOrgName,
  showSenderInfo = false,
}: MessageBubbleProps) {
  const displayName = message.sender_display_name || senderName || "Unknown";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const timeStr = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const orgName = senderOrgName;

  return (
    <div className={cn("flex items-end gap-2 mb-1", isSelf ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar (other party only) */}
      {!isSelf && showSenderInfo && (
        <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
          <AvatarImage src={senderImage} alt={displayName} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      {!isSelf && !showSenderInfo && <div className="w-7 flex-shrink-0" />}

      <div className={cn("max-w-[65%] flex flex-col", isSelf ? "items-end" : "items-start")}>
        {/* Sender label */}
        {!isSelf && showSenderInfo && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-foreground/80">{displayName}</span>
            {orgName && (
              <span className="text-xs text-muted-foreground">· {orgName}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
            isSelf
              ? "bg-[#F2713B] text-white rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm border border-border/40"
          )}
        >
          {message.body}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-1 px-1">{timeStr}</span>
      </div>
    </div>
  );
}
