import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/services/chatService";

interface MobileChatBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  senderName?: string;
  senderImage?: string;
  senderOrgName?: string;
  showSenderInfo?: boolean;
}

export function MobileChatBubble({
  message,
  isSelf,
  senderName,
  senderImage,
  senderOrgName,
  showSenderInfo = false,
}: MobileChatBubbleProps) {
  const displayName = message.sender_display_name || senderName || "Unknown";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const timeStr = formatDistanceToNow(new Date(message.created_at), { addSuffix: false });
  const isEmployerMessage = !isSelf && !!senderOrgName;

  return (
    <div className={cn("flex items-end gap-2 mb-1", isSelf ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar for other party */}
      {!isSelf && showSenderInfo ? (
        <Avatar className="w-8 h-8 flex-shrink-0 mb-1">
          <AvatarImage src={senderImage} alt={displayName} />
          <AvatarFallback className={cn(
            "text-[10px] font-semibold text-white",
            isEmployerMessage ? "bg-[#2B7FE8]" : "bg-muted-foreground"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : !isSelf ? (
        <div className="w-8 flex-shrink-0" />
      ) : null}

      <div className={cn("max-w-[72%] flex flex-col", isSelf ? "items-end" : "items-start")}>
        {/* Sender info (other party, first in group) */}
        {!isSelf && showSenderInfo && (
          <div className="flex items-center gap-1 mb-1 px-1">
            <span className="text-xs font-semibold text-foreground/80">{displayName}</span>
            {senderOrgName && (
              <span className="text-xs text-muted-foreground">· {senderOrgName}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
            isSelf
              ? "bg-[#F2713B] text-white rounded-br-md"
              : isEmployerMessage
                ? "bg-[#2B7FE8] text-white rounded-bl-md"
                : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          {message.body}
        </div>

        <span className="text-[10px] text-muted-foreground mt-1 px-1">{timeStr}</span>
      </div>
    </div>
  );
}
