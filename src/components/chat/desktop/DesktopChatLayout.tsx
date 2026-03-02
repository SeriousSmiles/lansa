import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChatThreads } from "@/hooks/useChatThreads";
import { ChatThreadList } from "./ChatThreadList";
import { ChatThreadView } from "./ChatThreadView";
import { MessageCircle } from "lucide-react";

interface DesktopChatLayoutProps {
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function DesktopChatLayout({ activeThreadId, onSelectThread }: DesktopChatLayoutProps) {
  const { user } = useAuth();
  const { threads, loading } = useChatThreads();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto h-screen flex flex-col px-6 lg:px-12 py-6">
        <div className="flex-1 flex rounded-2xl border border-border overflow-hidden bg-card shadow-sm min-h-0">
          {/* Left: Thread List */}
          <div className="w-[300px] flex-shrink-0 flex flex-col">
            <ChatThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              currentUserId={user.id}
              loading={loading}
              onSelect={onSelectThread}
            />
          </div>

          {/* Right: Active Thread or Empty State */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeThreadId ? (
              <ChatThreadView
                key={activeThreadId}
                threadId={activeThreadId}
                currentUserId={user.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your messages</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Select a conversation from the left to start messaging. Chats open after both parties connect.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
