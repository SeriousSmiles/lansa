import { useState, useEffect, useRef } from "react";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadChatCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);

  const refresh = async () => {
    if (!user) return;
    const count = await chatService.getTotalUnreadCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    if (!user) return;
    refresh();

    // Subscribe to inserts AND updates (e.g. read_at set) to keep badge accurate
    channelRef.current = supabase
      .channel(`unread_badge_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        () => refresh()
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  return unreadCount;
}
