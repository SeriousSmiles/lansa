import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopChatLayout } from "@/components/chat/desktop/DesktopChatLayout";
import { MobileChatInbox } from "@/components/chat/mobile/MobileChatInbox";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateProvider";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";

export default function Chat() {
  const isMobile = useIsMobile();
  const { userType } = useUserState();
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();

  if (isMobile && userType === "employer" && !threadId) return <Navigate to="/employer-dashboard?tab=messages" replace />;

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
    <PortalPageShell fullBleed>
      <DesktopChatLayout
        activeThreadId={threadId ?? null}
        onSelectThread={(id) => navigate(`/chat/${id}`)}
      />
    </PortalPageShell>
  );
}
