/**
 * Product Updates Service
 * Handles product update announcements
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProductUpdate {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  version?: string;
  image_url?: string;
  link_url?: string;
  published_at: string;
  created_at: string;
}

export const productUpdatesService = {
  /**
   * Get recent product updates
   */
  async getRecentUpdates(limit: number = 10): Promise<ProductUpdate[]> {
    const { data, error } = await supabase
      .from('product_updates')
      .select('*')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ProductUpdate[];
  },

  /**
   * Get count of unseen updates for current user
   */
  async getUnseenUpdatesCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get all published updates
    const { data: allUpdates, error: updatesError } = await supabase
      .from('product_updates')
      .select('id')
      .lte('published_at', new Date().toISOString());

    if (updatesError) throw updatesError;
    if (!allUpdates || allUpdates.length === 0) return 0;

    // Get seen updates
    const { data: seenUpdates, error: seenError } = await supabase
      .from('user_seen_updates')
      .select('update_id')
      .eq('user_id', user.id);

    if (seenError) throw seenError;

    const seenIds = new Set((seenUpdates || []).map((s) => s.update_id));
    return allUpdates.filter((u) => !seenIds.has(u.id)).length;
  },

  /**
   * Mark update as seen by current user
   */
  async markUpdateAsSeen(updateId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_seen_updates')
      .upsert({ user_id: user.id, update_id: updateId }, { onConflict: 'user_id,update_id' });

    if (error) throw error;
  },

  /**
   * Mark all updates as seen
   */
  async markAllUpdatesAsSeen(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: updates, error: fetchError } = await supabase
      .from('product_updates')
      .select('id')
      .lte('published_at', new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!updates || updates.length === 0) return;

    const records = updates.map((u) => ({
      user_id: user.id,
      update_id: u.id,
    }));

    const { error } = await supabase
      .from('user_seen_updates')
      .upsert(records, { onConflict: 'user_id,update_id' });

    if (error) throw error;
  },
};
