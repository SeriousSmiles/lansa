/**
 * Notification Service
 * Handles all notification operations
 */

import { supabase } from '@/integrations/supabase/client';
import { excludesSeekerInterest, SEEKER_INTEREST_TYPES, selfMatchExclusion } from './notificationAudienceModel';

// Shared by full history, dropdowns, badges and dashboard activity. Historical
// records remain untouched; only their relevance to this environment changes.
async function notificationReadQuery(userId: string, head = false) {
  const { data: answers, error } = await supabase.from('user_answers')
    .select('user_type').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  let query = supabase.from('notifications').select('*', { count: head ? 'exact' : undefined, head })
    .eq('user_id', userId).or(selfMatchExclusion(userId));
  if (excludesSeekerInterest(answers?.user_type)) {
    query = query.not('type', 'in', `(${SEEKER_INTEREST_TYPES.join(',')})`);
  }
  return { query };
}

export type NotificationType =
  | 'org_request_received'
  | 'org_request_approved'
  | 'org_request_rejected'
  | 'org_invitation_received'
  | 'org_member_joined'
  | 'org_role_changed'
  | 'job_application_received'
  | 'job_application_status_changed'
  | 'match_created'
  | 'employer_interest_received'
  | 'employer_nudge_received'
  | 'chat_request_received'
  | 'chat_request_accepted'
  | 'message_received'
  | 'system_update';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  /**
   * Get unread notifications for current user
   */
  async getUnreadNotifications(limit: number = 10): Promise<Notification[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { query } = await notificationReadQuery(user.id);
    const { data, error } = await query
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Get all notifications for current user with pagination
   */
  async getAllNotifications(
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { query } = await notificationReadQuery(user.id);
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { query } = await notificationReadQuery(user.id, true);
    const { count, error } = await query
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Recent activity uses the same audience rules as notifications and badges.
   */
  async getRecentNotifications(userId: string, since: string, limit: number): Promise<Notification[]> {
    const { query } = await notificationReadQuery(userId);
    const { data, error } = await query.gte('created_at', since)
      .order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return channel;
  },
};
