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
      // First, get all matches for this user
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order('latest_activity_at', { ascending: false });

      if (matchError) throw matchError;
      if (!matches || matches.length === 0) return [];

      // Extract all unique user IDs from matches
      const userIds = new Set<string>();
      matches.forEach(match => {
        userIds.add(match.user_a);
        userIds.add(match.user_b);
      });

      // Fetch user profiles for all involved users
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, name, title, profile_image')
        .in('user_id', Array.from(userIds));

      if (profileError) throw profileError;

      // Create a map for quick profile lookup
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Enrich matches with profile data
      const enrichedMatches = matches.map(match => ({
        ...match,
        user_profiles_a: profileMap.get(match.user_a) || null,
        user_profiles_b: profileMap.get(match.user_b) || null,
      }));

      return enrichedMatches;
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