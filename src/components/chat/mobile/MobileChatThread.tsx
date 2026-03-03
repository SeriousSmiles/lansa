import React, { useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatInput } from "../shared/ChatInput";
import { MobileChatBubble } from "./MobileChatBubble";
import { useChat } from "@/hooks/useChat";
import { MessageCircle } from "lucide-react";

interface MobileChatThreadProps {
  threadId: string;
  currentUserId: string;
  onBack: () => void;
}

export function MobileChatThread({ threadId, currentUserId, onBack }: MobileChatThreadProps) {
  const { messages, thread, loading, sending, sendMessage } = useChat(threadId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const other = thread?.other_party;
  const otherName = other?.name ?? "Unknown";
  const otherInitials = otherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isEmployerThread = !!other?.organization_name;
  const avatarSrc = (isEmployerThread && other?.organization_logo) ? other.organization_logo : (other?.profile_image ?? undefined);

  const shouldShowSenderInfo = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender_id !== messages[index - 1].sender_id;
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-[#F4F1ED]"
      style={{ height: '100dvh' }}
    >
      {/* Header — fixed at top */}
      <div
        className="flex items-center gap-2 px-4 pb-4 border-b border-border/40 bg-white flex-shrink-0 shadow-sm z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <button
          onClick={onBack}
          className="p-2.5 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-border/40">
          <AvatarImage src={avatarSrc} alt={otherName} />
          <AvatarFallback
            className="text-xs font-bold text-white"
            style={{ background: isEmployerThread ? "#2B7FE8" : "#F2713B" }}
          >
            {otherInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-[15px] leading-tight truncate">{otherName}</p>
          {other?.organization_name && (
            <p className="text-xs font-medium truncate mt-0.5" style={{ color: "#2B7FE8" }}>
              {other.organization_name}
            </p>
          )}
        </div>

        <button className="p-2.5 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages — scrollable middle */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 py-5 space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6 mt-8">
              <div className="w-16 h-16 rounded-3xl bg-muted/80 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-semibold text-foreground/70">Start the conversation</p>
              <p className="text-sm text-muted-foreground/60 mt-1.5">Say something to {otherName}!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MobileChatBubble
                  key={msg.id}
                  message={msg}
                  isSelf={msg.sender_id === currentUserId}
                  senderName={otherName}
                  senderImage={avatarSrc}
                  senderOrgName={other?.organization_name ?? undefined}
                  showSenderInfo={shouldShowSenderInfo(i)}
                />
              ))}
              <div ref={bottomRef} className="h-2" />
            </>
          )}
        </div>
      </div>

      {/* Input — fixed at bottom */}
      <div
        className="px-4 border-t border-border/40 bg-white flex-shrink-0 shadow-[0_-1px_8px_0_rgba(0,0,0,0.06)]"
        style={{ paddingTop: '12px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <ChatInput
          onSend={(body) => sendMessage(body)}
          disabled={sending}
          placeholder={`Message ${otherName}…`}
        />
      </div>
    </div>
  );
}
