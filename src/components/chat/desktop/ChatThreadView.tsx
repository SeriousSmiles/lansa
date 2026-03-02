import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "../shared/ChatInput";
import { useChat } from "@/hooks/useChat";
import type { ChatThread } from "@/services/chatService";
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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const other = thread?.other_party;
  const otherName = other?.name ?? "Unknown";
  const otherInitials = otherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Group messages: show sender info when sender changes
  const shouldShowSenderInfo = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender_id !== messages[index - 1].sender_id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarImage src={other?.profile_image ?? undefined} alt={otherName} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {otherInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground text-sm">{otherName}</p>
          {other?.organization_name && (
            <p className="text-xs text-muted-foreground">{other.organization_name}</p>
          )}
          {other?.title && !other?.organization_name && (
            <p className="text-xs text-muted-foreground">{other.title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-5 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 === 0 ? "w-48" : "w-56"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Say hello to start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSelf={msg.sender_id === currentUserId}
                senderName={otherName}
                senderImage={other?.profile_image ?? undefined}
                senderOrgName={other?.organization_name ?? undefined}
                showSenderInfo={shouldShowSenderInfo(i)}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border">
        <ChatInput
          onSend={(body) => sendMessage(body, senderDisplayName, senderOrgId)}
          disabled={sending}
          placeholder={`Message ${otherName}…`}
        />
      </div>
    </div>
  );
}
