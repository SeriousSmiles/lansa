import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  context: string;
  job_listing_id?: string;
  created_at: string;
  latest_activity_at: string;
}

export const matchService = {
  async getMatches(userId: string) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_profiles_a:user_profiles!matches_user_a_fkey(name, title, profile_image),
          user_profiles_b:user_profiles!matches_user_b_fkey(name, title, profile_image)
        `)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order('latest_activity_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
      return [];
    }
  },

  async getMatchesCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting matches:', error);
      return 0;
    }
  },

  celebrateMatch() {
    toast.success("🎉 It's a match!", {
      description: "You can now start a conversation!",
      duration: 4000,
    });
  }
};