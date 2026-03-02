import React, { useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "../shared/ChatInput";
import { MobileChatBubble } from "./MobileChatBubble";
import { useChat } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

interface MobileChatThreadProps {
  threadId: string;
  currentUserId: string;
  onBack: () => void;
}

export function MobileChatThread({ threadId, currentUserId, onBack }: MobileChatThreadProps) {
  const { messages, thread, loading, sending, sendMessage } = useChat(threadId);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const other = thread?.other_party;
  const otherName = other?.name ?? "Unknown";
  const otherInitials = otherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const shouldShowSenderInfo = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender_id !== messages[index - 1].sender_id;
  };

  const isEmployerThread = !!other?.organization_name;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Native-style header */}
      <div className="flex items-center gap-3 px-4 pt-safe-top pb-3 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={other?.profile_image ?? undefined} alt={otherName} />
            <AvatarFallback
              className="text-sm font-semibold text-white"
              style={{ background: isEmployerThread ? "#2B7FE8" : "#F2713B" }}
            >
              {otherInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{otherName}</p>
            {other?.organization_name && (
              <p className="text-xs text-muted-foreground truncate">{other.organization_name}</p>
            )}
          </div>
        </div>

        <button className="p-2 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {loading ? (
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`h-12 rounded-2xl bg-muted animate-pulse ${i % 2 === 0 ? "w-44" : "w-52"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Start the conversation</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Say something to {otherName}!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MobileChatBubble
                key={msg.id}
                message={msg}
                isSelf={msg.sender_id === currentUserId}
                senderName={otherName}
                senderImage={other?.profile_image ?? undefined}
                senderOrgName={other?.organization_name ?? undefined}
                showSenderInfo={shouldShowSenderInfo(i)}
              />
            ))}
            <div ref={bottomRef} className="h-4" />
          </>
        )}
      </ScrollArea>

      {/* Input area — sticky bottom */}
      <div className="px-4 py-3 border-t border-border bg-card/80 backdrop-blur-md sticky bottom-0 pb-safe-bottom">
        <ChatInput
          onSend={(body) => sendMessage(body)}
          disabled={sending}
          placeholder={`Message ${otherName}…`}
        />
      </div>
    </div>
  );
}
