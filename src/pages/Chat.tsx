import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopChatLayout } from "@/components/chat/desktop/DesktopChatLayout";
import { MobileChatInbox } from "@/components/chat/mobile/MobileChatInbox";
import { useParams, useNavigate } from "react-router-dom";
import { usePortalMode } from "@/hooks/usePortalMode";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";

export default function Chat() {
  const isMobile = useIsMobile();
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const { portalV2 } = usePortalMode();

  if (isMobile) {
    return (
      <MobileChatInbox
        activeThreadId={threadId ?? null}
        onSelectThread={(id) => navigate(`/chat/${id}`)}
        onBack={() => navigate("/chat")}
      />
    );
  }

  if (portalV2) {
    return (
      <PortalPageShell fullBleed>
        <DesktopChatLayout
          activeThreadId={threadId ?? null}
          onSelectThread={(id) => navigate(`/chat/${id}`)}
        />
      </PortalPageShell>
    );
  }

  return (
    <DesktopChatLayout
      activeThreadId={threadId ?? null}
      onSelectThread={(id) => navigate(`/chat/${id}`)}
    />
  );
}
