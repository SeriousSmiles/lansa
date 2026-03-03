import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, type ChatThread } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";

export function useChatThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);
  // Debounce timer so that a markThreadRead + realtime UPDATE don't race
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await chatService.getThreadsForUser();
      setThreads(data);
    } catch (e) {
      console.error('[useChatThreads] error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounced reload — waits 600ms after last event before re-fetching.
  // This prevents the race where markThreadRead hasn't committed yet when
  // the realtime UPDATE fires and would restore the old unread count.
  const debouncedReload = useCallback(() => {
    if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    reloadTimerRef.current = setTimeout(() => {
      loadThreads();
    }, 600);
  }, [loadThreads]);

  useEffect(() => {
    if (!user) return;
    loadThreads();

    channelRef.current = chatService.subscribeToThreadList(user.id, debouncedReload);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [user, loadThreads, debouncedReload]);

  const clearUnread = useCallback((threadId: string) => {
    // Optimistically zero out unread count locally so the UI
    // responds instantly while markThreadRead commits to the DB.
    setThreads(prev =>
      prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t)
    );
  }, []);

  return { threads, loading, reload: loadThreads, clearUnread };
}
