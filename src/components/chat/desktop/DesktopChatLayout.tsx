import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChatThreads } from "@/hooks/useChatThreads";
import { ChatThreadList } from "./ChatThreadList";
import { ChatThreadView } from "./ChatThreadView";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateProvider";

interface DesktopChatLayoutProps {
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function DesktopChatLayout({ activeThreadId, onSelectThread }: DesktopChatLayoutProps) {
  const { user } = useAuth();
  const { threads, loading, clearUnread } = useChatThreads();
  const { userType } = useUserState();
  const navigate = useNavigate();

  if (!user) return null;

  const dashboardPath = userType === 'employer' ? '/employer-dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#FDF8F2]">
      <div className="max-w-[1280px] mx-auto h-screen flex flex-col px-6 lg:px-10 py-6">
        {/* Top nav bar */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-border">·</span>
          <h1 className="text-base font-semibold text-foreground">Messages</h1>
        </div>

        <div className="flex-1 flex rounded-2xl border border-border/60 overflow-hidden bg-card shadow-md min-h-0">
          {/* Left: Thread List */}
          <div className="w-[320px] flex-shrink-0 flex flex-col bg-card">
            <ChatThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              currentUserId={user.id}
              loading={loading}
              onSelect={(id) => { clearUnread(id); onSelectThread(id); }}
            />
          </div>

          {/* Right: Active Thread or Empty State */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
            {activeThreadId ? (
              <ChatThreadView
                key={activeThreadId}
                threadId={activeThreadId}
                currentUserId={user.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-10">
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Select a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Choose a conversation from the left to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
