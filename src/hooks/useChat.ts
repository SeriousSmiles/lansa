import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, type ChatMessage, type ChatThread } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useChat(threadId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<any>(null);

  const loadMessages = useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    try {
      const [msgs, t] = await Promise.all([
        chatService.getMessages(threadId),
        chatService.getThread(threadId),
      ]);
      setMessages(msgs);
      setThread(t);
      // Mark as read when opening — then clear unread count on thread
      await chatService.markThreadRead(threadId);
      setThread(prev => prev ? { ...prev, unread_count: 0 } : t ? { ...t, unread_count: 0 } : null);
    } catch (e) {
      console.error('[useChat] load error:', e);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setThread(null);
      return;
    }

    loadMessages();

    // Subscribe to real-time messages
    channelRef.current = chatService.subscribeToThread(threadId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Mark as read immediately when a new message arrives while thread is open
      chatService.markThreadRead(threadId).then(() => {
        setThread(prev => prev ? { ...prev, unread_count: 0 } : prev);
      });
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (body: string, senderDisplayName?: string, senderOrgId?: string) => {
      if (!threadId || !body.trim() || sending) return;
      setSending(true);
      try {
        const msg = await chatService.sendMessage(
          threadId,
          body,
          senderDisplayName,
          senderOrgId
        );
        // Optimistic update (real-time will also fire but we dedupe)
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch (e: any) {
        console.error('[useChat] send error:', e);
        toast.error(e?.message ?? 'Failed to send message. Please try again.');
        throw e;
      } finally {
        setSending(false);
      }
    },
    [threadId, sending]
  );

  return { messages, thread, loading, sending, sendMessage, reload: loadMessages };
}
