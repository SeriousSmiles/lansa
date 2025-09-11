import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { swipeService, SwipeDirection, SwipeContext } from "./swipeService";
import { matchService } from "./matchService";
import type { DiscoveryProfile, DiscoveryFilters } from "./discoveryService";
import { mockFrontendCandidates } from "@/data/mockCandidates";

export interface CandidateFilters extends DiscoveryFilters {
  jobReady?: boolean;
  internshipReady?: boolean;
  lansaCertified?: boolean;
  availability?: string;
}

export const candidateDiscoveryService = {
  async getFilteredCandidates(
    userId: string,
    filters: CandidateFilters = {},
    limit: number = 20
  ): Promise<DiscoveryProfile[]> {
    try {
      let query = supabase
        .from('user_profiles_public')
        .select('*');

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      if (filters.location) {
        // Note: Would need location field in user_profiles_public
        // For now, skip location filtering on database level
      }

      const { data: profiles, error } = await query.limit(limit);

      if (error) throw error;

      let candidates: DiscoveryProfile[] = [];
      
      if (profiles && profiles.length > 0) {
        candidates = profiles.map(profile => ({
          user_id: profile.user_id,
          name: profile.name || 'Professional',
          title: profile.title || 'Seeking Opportunities',
          about_text: profile.about_text,
          profile_image: profile.profile_image,
          skills: profile.skills || [],
          cover_color: profile.cover_color,
          highlight_color: profile.highlight_color || '#FF6B4A',
          professional_goal: profile.professional_goal
        }));
      } else {
        // Fallback to mock data
        candidates = [...mockFrontendCandidates];
      }

      // Filter out users that have already been swiped
      const swipeHistory = await swipeService.getSwipeHistory(userId, 'employee');
      const swipedUserIds = swipeHistory.map(s => s.target_user_id);
      
      const filteredCandidates = candidates.filter(
        candidate => !swipedUserIds.includes(candidate.user_id)
      );

      // Apply client-side filters
      let finalCandidates = filteredCandidates;

      if (filters.skills && filters.skills.length > 0) {
        finalCandidates = finalCandidates.filter(candidate =>
          filters.skills!.some(skill => 
            candidate.skills.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      // Shuffle for variety
      return finalCandidates.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error('Error fetching filtered candidates:', error);
      // Return mock data on error
      return [...mockFrontendCandidates].sort(() => Math.random() - 0.5).slice(0, limit);
    }
  },

  async swipeCandidate(
    swiperId: string,
    targetCandidate: DiscoveryProfile,
    direction: SwipeDirection,
    jobListingId?: string
  ): Promise<{ isMatch: boolean; matchId?: string }> {
    try {
      // Record the swipe
      const swipeData = {
        swiper_user_id: swiperId,
        target_user_id: targetCandidate.user_id,
        direction,
        context: 'employee' as SwipeContext,
        job_listing_id: jobListingId
      };

      await swipeService.recordSwipe(swipeData);

      // Check for match only if it's a positive swipe
      if (direction === 'right' || direction === 'nudge') {
        const existingMatch = await swipeService.checkForMatch(
          swiperId,
          targetCandidate.user_id,
          'employee',
          jobListingId
        );

        if (existingMatch) {
          // It's a match!
          matchService.celebrateMatch();
          return { isMatch: true, matchId: existingMatch.id };
        }
      }

      // Provide feedback for different swipe types
      if (direction === 'right') {
        toast.success("Candidate liked! 👍");
      } else if (direction === 'nudge') {
        toast.success("Super like sent! ⭐");
      } else {
        toast("Candidate passed", { icon: "👎" });
      }

      return { isMatch: false };
    } catch (error) {
      console.error('Error swiping candidate:', error);
      toast.error("Failed to record swipe");
      return { isMatch: false };
    }
  },

  async getSwipeStats(userId: string): Promise<{
    todayCount: number;
    weekCount: number;
    matchCount: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get today's swipes
      const { count: todayCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('swiper_user_id', userId)
        .gte('created_at', today.toISOString());

      // Get week's swipes
      const { count: weekCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('swiper_user_id', userId)
        .gte('created_at', weekAgo.toISOString());

      // Get match count
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      return {
        todayCount: todayCount || 0,
        weekCount: weekCount || 0,
        matchCount: matchCount || 0
      };
    } catch (error) {
      console.error('Error fetching swipe stats:', error);
      return {
        todayCount: 0,
        weekCount: 0,
        matchCount: 0
      };
    }
  },

  // Real-time subscription for new matches
  subscribeToNewMatches(userId: string, callback: (match: any) => void) {
    return supabase
      .channel('new-matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          // Only notify if this user is involved
          if (payload.new.user_a === userId || payload.new.user_b === userId) {
            callback(payload.new);
          }
        }
      )
      .subscribe();
  }
};