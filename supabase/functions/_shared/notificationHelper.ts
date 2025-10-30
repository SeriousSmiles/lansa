/**
 * Notification Helper
 * Shared helper for creating notifications in edge functions
 */

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export type NotificationType =
  | "org_request_received"
  | "org_request_approved"
  | "org_request_rejected"
  | "org_invitation_received"
  | "org_member_joined"
  | "org_role_changed"
  | "job_application_received"
  | "job_application_status_changed"
  | "match_created"
  | "message_received"
  | "system_update";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  supabase: SupabaseClient,
  params: CreateNotificationParams
): Promise<void> {
  const { userId, type, title, message, actionUrl, metadata } = params;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    action_url: actionUrl,
    metadata: metadata || {},
  });

  if (error) {
    console.error("[notificationHelper] Failed to create notification:", error);
    throw error;
  }

  console.log(`[notificationHelper] Notification created for user ${userId}: ${type}`);
}

/**
 * Create notifications for multiple users
 */
export async function createNotifications(
  supabase: SupabaseClient,
  notifications: CreateNotificationParams[]
): Promise<void> {
  const records = notifications.map((n) => ({
    user_id: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    action_url: n.actionUrl,
    metadata: n.metadata || {},
  }));

  const { error } = await supabase.from("notifications").insert(records);

  if (error) {
    console.error("[notificationHelper] Failed to create bulk notifications:", error);
    throw error;
  }

  console.log(`[notificationHelper] Created ${notifications.length} notifications`);
}
