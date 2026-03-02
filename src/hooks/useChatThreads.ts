import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, type ChatThread } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";

export function useChatThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

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

  useEffect(() => {
    if (!user) return;
    loadThreads();

    // Real-time: refresh thread list on any message activity
    channelRef.current = chatService.subscribeToThreadList(user.id, () => {
      loadThreads();
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, loadThreads]);

  return { threads, loading, reload: loadThreads };
}
