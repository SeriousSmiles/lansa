import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
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
  const timeStr = format(new Date(message.created_at), "h:mm a");
  const isEmployerSender = !isSelf && !!senderOrgName;

  return (
    <div className={cn(
      "flex items-end gap-2.5",
      isSelf ? "flex-row-reverse" : "flex-row",
      showSenderInfo ? "mt-3" : "mt-1"
    )}>
      {/* Avatar (other party only) */}
      {!isSelf ? (
        showSenderInfo ? (
          <Avatar className="w-7 h-7 flex-shrink-0 mb-1 ring-1 ring-border/30">
            <AvatarImage src={senderImage} alt={displayName} />
            <AvatarFallback
              className="text-[10px] font-bold text-white"
              style={{ background: isEmployerSender ? "#2B7FE8" : "#F2713B" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-7 flex-shrink-0" />
        )
      ) : null}

      <div className={cn("max-w-[62%] flex flex-col gap-1", isSelf ? "items-end" : "items-start")}>
        {/* Sender label */}
        {!isSelf && showSenderInfo && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs font-semibold text-foreground/75">{displayName}</span>
            {senderOrgName && (
              <span className="text-xs text-muted-foreground/70">· {senderOrgName}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed break-words shadow-sm",
            isSelf
              ? "bg-[#F2713B] text-white rounded-2xl rounded-br-md"
              : "bg-white text-foreground rounded-2xl rounded-bl-md border border-border/20 shadow-sm"
          )}
        >
          {message.body}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/60 px-1">{timeStr}</span>
      </div>
    </div>
  );
}
