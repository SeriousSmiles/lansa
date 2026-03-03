import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatThread {
  id: string;
  participant_ids: string[];
  context: string;
  connection_request_id: string | null;
  org_id: string | null;
  thread_status: string;
  last_message_at: string | null;
  created_at: string;
  // Enriched fields
  other_party?: {
    user_id: string;
    name: string;
    profile_image: string | null;
    title: string | null;
    organization_name: string | null;
    organization_logo: string | null;
  };
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  sender_display_name: string | null;
  sender_org_id: string | null;
  read_at: string | null;
  created_at: string;
}

export const chatService = {
  /**
   * Get all chat threads for the current user, enriched with other party info.
   */
  async getThreadsForUser(): Promise<ChatThread[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: threads, error } = await supabase
      .from('chat_threads')
      .select('*')
      .contains('participant_ids', [user.id])
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    if (!threads || threads.length === 0) return [];

    // Collect all other-party user IDs
    const otherPartyIds = threads.map(t =>
      t.participant_ids.find((id: string) => id !== user.id)
    ).filter(Boolean) as string[];

    const uniqueIds = [...new Set(otherPartyIds)];

    // Fetch participant profile info
    const { data: participants } = await supabase
      .from('chat_participants_view')
      .select('user_id, name, profile_image, title, organization_name, organization_logo')
      .in('user_id', uniqueIds);

    const participantMap = new Map(participants?.map(p => [p.user_id, p]) ?? []);

    // Fetch last message per thread
    const threadIds = threads.map(t => t.id);
    const { data: lastMessages } = await supabase
      .from('chat_messages')
      .select('thread_id, body, created_at')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false });

    const lastMessageMap = new Map<string, string>();
    lastMessages?.forEach(msg => {
      if (!lastMessageMap.has(msg.thread_id)) {
        lastMessageMap.set(msg.thread_id, msg.body);
      }
    });

    // Fetch unread counts
    const { data: unreadMessages } = await supabase
      .from('chat_messages')
      .select('thread_id')
      .in('thread_id', threadIds)
      .neq('sender_id', user.id)
      .is('read_at', null);

    const unreadMap = new Map<string, number>();
    unreadMessages?.forEach(msg => {
      unreadMap.set(msg.thread_id, (unreadMap.get(msg.thread_id) ?? 0) + 1);
    });

    return threads.map(t => {
      const otherPartyId = t.participant_ids.find((id: string) => id !== user.id);
      const p = otherPartyId ? participantMap.get(otherPartyId) : null;
      return {
        id: t.id,
        participant_ids: t.participant_ids,
        context: t.context,
        connection_request_id: t.connection_request_id ?? null,
        org_id: t.org_id ?? null,
        thread_status: (t as any).thread_status ?? 'active',
        last_message_at: t.last_message_at,
        created_at: t.created_at,
        other_party: p ? {
          user_id: p.user_id,
          name: p.name ?? 'Unknown',
          profile_image: p.profile_image ?? null,
          title: p.title ?? null,
          organization_name: p.organization_name ?? null,
          organization_logo: p.organization_logo ?? null,
        } : undefined,
        last_message: lastMessageMap.get(t.id),
        unread_count: unreadMap.get(t.id) ?? 0,
      };
    });
  },

  /**
   * Get messages for a specific thread.
   */
  async getMessages(
    threadId: string,
    limit = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  },

  /**
   * Send a message in a thread.
   */
  async sendMessage(
    threadId: string,
    body: string,
    senderDisplayName?: string,
    senderOrgId?: string
  ): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        body: body.trim(),
        sender_display_name: senderDisplayName ?? null,
        sender_org_id: senderOrgId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('[chatService] sendMessage error:', error);
      throw error;
    }

    // Update thread last_message_at
    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    return data as ChatMessage;
  },

  /**
   * Mark all unread messages in a thread as read.
   */
  async markThreadRead(threadId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .neq('sender_id', user.id)
      .is('read_at', null);
  },

  /**
   * Subscribe to real-time messages in a thread.
   */
  subscribeToThread(
    threadId: string,
    onMessage: (msg: ChatMessage) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`chat_thread_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Subscribe to real-time thread list updates (new messages, new threads).
   */
  subscribeToThreadList(
    userId: string,
    onUpdate: () => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`chat_threads_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_threads',
        },
        onUpdate
      )
      .subscribe();

    return channel;
  },

  /**
   * Get a single thread by ID.
   */
  async getThread(threadId: string): Promise<ChatThread | null> {
    const threads = await chatService.getThreadsForUser();
    return threads.find(t => t.id === threadId) ?? null;
  },

  /**
   * Get total unread message count across all threads.
   */
  async getTotalUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // First get all thread IDs the user participates in
    const { data: threadRows } = await supabase
      .from('chat_threads')
      .select('id')
      .contains('participant_ids', [user.id]);

    if (!threadRows || threadRows.length === 0) return 0;

    const threadIds = threadRows.map(r => r.id);

    const { count } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', threadIds)
      .neq('sender_id', user.id)
      .is('read_at', null);

    return count ?? 0;
  },
};
