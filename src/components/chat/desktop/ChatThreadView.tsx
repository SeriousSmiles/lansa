import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "../shared/ChatInput";
import { useChat } from "@/hooks/useChat";
import { MessageCircle } from "lucide-react";

interface ChatThreadViewProps {
  threadId: string;
  currentUserId: string;
  senderDisplayName?: string;
  senderOrgId?: string;
}

export function ChatThreadView({
  threadId,
  currentUserId,
  senderDisplayName,
  senderOrgId,
}: ChatThreadViewProps) {
  const { messages, thread, loading, sending, sendMessage } = useChat(threadId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const other = thread?.other_party;
  const otherName = other?.name ?? "Unknown";
  const otherInitials = otherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isEmployer = !!other?.organization_name;
  const avatarSrc = (isEmployer && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined);

  const shouldShowSenderInfo = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender_id !== messages[index - 1].sender_id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3.5 bg-white">
        <Avatar className="w-10 h-10 ring-2 ring-border/40 flex-shrink-0">
          <AvatarImage src={avatarSrc} alt={otherName} />
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ background: isEmployer ? "#2B7FE8" : "#F2713B" }}
          >
            {otherInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight">{otherName}</p>
          {other?.organization_name ? (
            <p className="text-xs font-medium mt-0.5" style={{ color: "#2B7FE8" }}>{other.organization_name}</p>
          ) : other?.title ? (
            <p className="text-xs text-muted-foreground mt-0.5">{other.title}</p>
          ) : null}
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Active" />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground/70">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Say hello to start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isSelf={msg.sender_id === currentUserId}
                  senderName={otherName}
                  senderImage={avatarSrc}
                  senderOrgName={other?.organization_name ?? undefined}
                  showSenderInfo={shouldShowSenderInfo(i)}
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/60 bg-white">
        <ChatInput
          onSend={(body) => sendMessage(body, senderDisplayName, senderOrgId)}
          disabled={sending}
          placeholder={`Message ${otherName}…`}
        />
      </div>
    </div>
  );
}
