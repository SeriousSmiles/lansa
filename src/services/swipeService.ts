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

export const swipeService = {
  async recordSwipe(swipeData: SwipeData) {
    try {
      const { data, error } = await supabase
        .from('swipes')
        .insert([swipeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast.error('Failed to record swipe');
      throw error;
    }
  },

  async checkForMatch(swiperId: string, targetId: string, context: SwipeContext, jobListingId?: string) {
    try {
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
  }
};