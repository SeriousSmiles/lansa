import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { ChatThreadListItem } from "./ChatThreadListItem";
import type { ChatThread } from "@/services/chatService";
import { cn } from "@/lib/utils";

interface ChatThreadListProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  currentUserId: string;
  loading: boolean;
  onSelect: (threadId: string) => void;
}

export function ChatThreadList({
  threads,
  activeThreadId,
  currentUserId,
  loading,
  onSelect,
}: ChatThreadListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        {threads.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{threads.length} conversation{threads.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-1 p-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connections appear here once a request is accepted
            </p>
          </div>
        ) : (
          threads.map(thread => (
            <ChatThreadListItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              currentUserId={currentUserId}
              onClick={() => onSelect(thread.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
