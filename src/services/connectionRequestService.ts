import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "./notificationService";

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_org_id: string | null;
  intro_note: string | null;
  status: 'pending' | 'accepted' | 'declined';
  source: 'browse' | 'job_application' | 'candidate_initiated';
  job_listing_id: string | null;
  thread_id: string | null;
  created_at: string;
  responded_at: string | null;
  // Joined fields (app-level)
  requester_name?: string;
  requester_profile_image?: string;
  requester_organization_name?: string;
  requester_organization_logo?: string;
  recipient_name?: string;
  recipient_profile_image?: string;
}

export const connectionRequestService = {
  /**
   * Send a connection request from the current user to a recipient.
   * Used by employers browsing candidates and candidates reaching out.
   */
  async sendRequest(
    recipientId: string,
    introNote?: string,
    orgId?: string,
    jobListingId?: string,
    source: 'browse' | 'job_application' | 'candidate_initiated' = 'browse'
  ): Promise<ConnectionRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('connection_requests')
      .select('id, status')
      .eq('requester_id', user.id)
      .eq('recipient_id', recipientId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      throw new Error('A pending connection request already exists.');
    }

    const { data, error } = await supabase
      .from('connection_requests')
      .insert({
        requester_id: user.id,
        recipient_id: recipientId,
        requester_org_id: orgId ?? null,
        intro_note: introNote?.trim() || null,
        source,
        job_listing_id: jobListingId ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Create in-app notification for recipient
    try {
      await notificationService.createNotification(
        recipientId,
        'message_received' as any,
        'New connection request',
        introNote
          ? `Someone wants to connect: "${introNote.slice(0, 60)}${introNote.length > 60 ? '…' : ''}"`
          : 'Someone wants to connect with you on Lansa.',
        '/notifications'
      );
    } catch (e) {
      console.warn('[connectionRequestService] Notification failed:', e);
    }

    return data as ConnectionRequest;
  },

  /**
   * Accept a connection request (only recipient can call this).
   * The DB trigger auto-creates the chat thread.
   */
  async acceptRequest(requestId: string): Promise<{ thread_id: string }> {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;

    // Poll for thread_id (trigger creates it asynchronously)
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 300));
      const { data } = await supabase
        .from('connection_requests')
        .select('thread_id')
        .eq('id', requestId)
        .single();
      if (data?.thread_id) return { thread_id: data.thread_id };
    }

    // Fallback: look up thread by connection_request_id
    const { data: thread } = await supabase
      .from('chat_threads')
      .select('id')
      .eq('connection_request_id', requestId)
      .maybeSingle();

    if (thread?.id) return { thread_id: thread.id };
    throw new Error('Thread creation timed out. Please refresh.');
  },

  /**
   * Decline a connection request.
   */
  async declineRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
  },

  /**
   * Get all pending requests received by the current user (candidate side).
   */
  async getPendingRequestsForUser(): Promise<ConnectionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Enrich with requester profile info
    const requesterIds = data.map(r => r.requester_id);
    const { data: participants } = await supabase
      .from('chat_participants_view')
      .select('user_id, name, profile_image, organization_name, organization_logo')
      .in('user_id', requesterIds);

    const participantMap = new Map(participants?.map(p => [p.user_id, p]) ?? []);

    return data.map(req => {
      const p = participantMap.get(req.requester_id);
      return {
        ...req,
        status: req.status as ConnectionRequest['status'],
        source: req.source as ConnectionRequest['source'],
        requester_name: p?.name ?? 'Unknown',
        requester_profile_image: p?.profile_image ?? null,
        requester_organization_name: p?.organization_name ?? null,
        requester_organization_logo: p?.organization_logo ?? null,
      };
    });
  },

  /**
   * Get all pending requests sent by the current user (employer side).
   */
  async getPendingSentRequests(): Promise<ConnectionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Enrich with recipient profile info
    const recipientIds = data.map(r => r.recipient_id);
    const { data: participants } = await supabase
      .from('chat_participants_view')
      .select('user_id, name, profile_image')
      .in('user_id', recipientIds);

    const participantMap = new Map(participants?.map(p => [p.user_id, p]) ?? []);

    return data.map(req => {
      const p = participantMap.get(req.recipient_id);
      return {
        ...req,
        status: req.status as ConnectionRequest['status'],
        source: req.source as ConnectionRequest['source'],
        recipient_name: p?.name ?? 'Unknown',
        recipient_profile_image: p?.profile_image ?? null,
      };
    });
  },

  /**
   * Check if a pending or accepted request exists between two users.
   */
  async getRequestBetween(
    userId: string,
    otherUserId: string
  ): Promise<ConnectionRequest | null> {
    const { data } = await supabase
      .from('connection_requests')
      .select('*')
      .or(
        `and(requester_id.eq.${userId},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    return {
      ...data,
      status: data.status as ConnectionRequest['status'],
      source: data.source as ConnectionRequest['source'],
    };
  },
};
