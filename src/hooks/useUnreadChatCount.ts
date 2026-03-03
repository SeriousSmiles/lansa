import { useState, useEffect, useRef, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadChatCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const count = await chatService.getTotalUnreadCount();
    setUnreadCount(count);
  }, [user]);

  // Debounced refresh — waits 700ms after last event.
  // Prevents race between markThreadRead DB write and the realtime UPDATE
  // that would fire before read_at is committed, restoring the old badge count.
  const debouncedRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => refresh(), 700);
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    refresh();

    channelRef.current = supabase
      .channel(`unread_badge_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, debouncedRefresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, debouncedRefresh)
      .subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, debouncedRefresh]);

  return unreadCount;
}
