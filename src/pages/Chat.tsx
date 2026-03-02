import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopChatLayout } from "@/components/chat/desktop/DesktopChatLayout";
import { MobileChatInbox } from "@/components/chat/mobile/MobileChatInbox";
import { useParams, useNavigate } from "react-router-dom";

export default function Chat() {
  const isMobile = useIsMobile();
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <MobileChatInbox
        activeThreadId={threadId ?? null}
        onSelectThread={(id) => navigate(`/chat/${id}`)}
        onBack={() => navigate("/chat")}
      />
    );
  }

  return (
    <DesktopChatLayout
      activeThreadId={threadId ?? null}
      onSelectThread={(id) => navigate(`/chat/${id}`)}
    />
  );
}
