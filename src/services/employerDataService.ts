import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  candidatesViewed: number;
  newMatches: number;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry?: string;
  company_size?: string;
  location?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const employerDataService = {
  async getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching business profile:', error);
      return null;
    }
  },

  async createBusinessProfile(profileData: Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      toast.success("Business profile created successfully");
      return data;
    } catch (error) {
      console.error('Error creating business profile:', error);
      toast.error("Failed to create business profile");
      return null;
    }
  },

  async updateBusinessProfile(userId: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      toast.success("Business profile updated");
      return data;
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast.error("Failed to update business profile");
      return null;
    }
  },

  async getEmployerStats(userId: string): Promise<EmployerStats> {
    try {
      // Get business profile to fetch related data
      const businessProfile = await this.getBusinessProfile(userId);
      
      if (!businessProfile) {
        return {
          activeJobs: 0,
          totalApplications: 0,
          candidatesViewed: 0,
          newMatches: 0
        };
      }

      // Get active jobs count
      const { count: activeJobs } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessProfile.id)
        .eq('is_active', true);

      // Get swipes count (candidates viewed)
      const { count: candidatesViewed } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('swiper_user_id', userId);

      // Get matches count
      const { count: newMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      return {
        activeJobs: activeJobs || 0,
        totalApplications: 0, // TODO: Implement when applications table exists
        candidatesViewed: candidatesViewed || 0,
        newMatches: newMatches || 0
      };
    } catch (error) {
      console.error('Error fetching employer stats:', error);
      return {
        activeJobs: 0,
        totalApplications: 0,
        candidatesViewed: 0,
        newMatches: 0
      };
    }
  },

  // Real-time subscriptions
  subscribeToJobListings(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel('job-listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_listings',
          filter: `business_id=eq.${businessId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToMatches(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          // Only notify if this user is involved in the match
          if (payload.new.user_a === userId || payload.new.user_b === userId) {
            callback(payload);
          }
        }
      )
      .subscribe();
  }
};