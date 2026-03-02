import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SwipeDirection = 'left' | 'right' | 'nudge';
export type SwipeContext = 'employee' | 'internship';

export interface SwipeData {
  swiper_user_id: string;
  target_user_id: string;
  direction: SwipeDirection;
  context: SwipeContext;
  job_listing_id?: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (id: string): boolean => UUID_REGEX.test(id);

export const swipeService = {
  async recordSwipe(swipeData: SwipeData) {
    try {
      // Skip database recording for mock candidates (non-UUID IDs)
      if (!isValidUUID(swipeData.target_user_id)) {
        console.log('Skipping swipe recording for mock candidate:', swipeData.target_user_id);
        return { 
          ...swipeData, 
          id: `mock-swipe-${Date.now()}`, 
          created_at: new Date().toISOString() 
        };
      }

      const { data, error } = await supabase
        .from('swipes')
        .upsert([swipeData], {
          onConflict: 'swiper_user_id,target_user_id,context',
          ignoreDuplicates: true,
        })
        .select()
        .single();

      if (error && error.code !== '23505') throw error;
      return data;
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast.error('Failed to record swipe');
      throw error;
    }
  },

  async checkForMatch(swiperId: string, targetId: string, context: SwipeContext, jobListingId?: string) {
    try {
      // Skip match check for mock candidates
      if (!isValidUUID(targetId)) {
        return null;
      }

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_a.eq.${swiperId},user_b.eq.${targetId}),and(user_a.eq.${targetId},user_b.eq.${swiperId})`)
        .eq('context', context)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking for match:', error);
      return null;
    }
  },

  async getSwipeHistory(userId: string, context: SwipeContext) {
    try {
      const { data, error } = await supabase
        .from('swipes')
        .select('target_user_id, direction, created_at')
        .eq('swiper_user_id', userId)
        .eq('context', context)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching swipe history:', error);
      return [];
    }
  },

  async deleteLastSwipe(userId: string, context: SwipeContext) {
    try {
      // Get the most recent swipe
      const { data: lastSwipe, error: fetchError } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_user_id', userId)
        .eq('context', context)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!lastSwipe) return null;

      const { error: deleteError } = await supabase
        .from('swipes')
        .delete()
        .eq('id', lastSwipe.id);

      if (deleteError) throw deleteError;
      return lastSwipe.id;
    } catch (error) {
      console.error('Error deleting last swipe:', error);
      return null;
    }
  }
};