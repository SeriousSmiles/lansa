import { supabase } from "@/integrations/supabase/client";
import { SwipeContext } from "./swipeService";

export interface DiscoveryProfile {
  user_id: string;
  name: string;
  title: string;
  about_text?: string;
  profile_image?: string;
  skills: string[];
  cover_color?: string;
  highlight_color?: string;
  professional_goal?: string;
}

export interface DiscoveryFilters {
  location?: string;
  skills?: string[];
  experienceLevel?: string;
  availability?: string;
}

export const discoveryService = {
  async getDiscoveryProfiles(
    userId: string, 
    context: SwipeContext, 
    filters: DiscoveryFilters = {},
    limit: number = 10
  ): Promise<DiscoveryProfile[]> {
    try {
      // Get users that haven't been swiped on yet
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('target_user_id')
        .eq('swiper_user_id', userId)
        .eq('context', context);

      const swipedUserIds = swipedUsers?.map(s => s.target_user_id) || [];
      
      let query = supabase
        .from('user_profiles_public')
        .select('*')
        .neq('user_id', userId);

      // Exclude already swiped users
      if (swipedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      }

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching discovery profiles:', error);
      return [];
    }
  },

  async getJobListings(userId: string, filters: DiscoveryFilters = {}, limit: number = 10) {
    try {
      const { data: swipedJobs } = await supabase
        .from('swipes')
        .select('job_listing_id')
        .eq('swiper_user_id', userId)
        .eq('context', 'employee')
        .not('job_listing_id', 'is', null);

      const swipedJobIds = swipedJobs?.map(s => s.job_listing_id).filter(Boolean) || [];

      let query = supabase
        .from('job_listings')
        .select(`
          *,
          business_profiles(company_name, location, industry)
        `)
        .eq('is_active', true);

      if (swipedJobIds.length > 0) {
        query = query.not('id', 'in', `(${swipedJobIds.join(',')})`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('top_skills', filters.skills);
      }

      const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job listings:', error);
      return [];
    }
  }
};