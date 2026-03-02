import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, type ChatMessage, type ChatThread } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";

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
      // Mark as read when opening
      await chatService.markThreadRead(threadId);
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
        // Avoid duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Mark read immediately if we're viewing the thread
      chatService.markThreadRead(threadId);
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [threadId, loadMessages]);

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
      } catch (e) {
        console.error('[useChat] send error:', e);
        throw e;
      } finally {
        setSending(false);
      }
    },
    [threadId, sending]
  );

  return { messages, thread, loading, sending, sendMessage, reload: loadMessages };
}
