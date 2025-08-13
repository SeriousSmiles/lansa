import { supabase } from "@/integrations/supabase/client";
import { SwipeContext } from "./swipeService";
import { mockFrontendCandidates } from "@/data/mockCandidates";

// Use mock data for demo purposes
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
      // For demo purposes, return mock data with filtering
      let filteredProfiles = [...mockFrontendCandidates];
      
      // Apply skill filtering if provided
      if (filters.skills && filters.skills.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile =>
          filters.skills!.some(skill => 
            profile.skills.some(profileSkill => 
              profileSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }
      
      // Shuffle for variety and take requested limit
      const shuffled = filteredProfiles.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error fetching discovery profiles:', error);
      return [];
    }
  },

  async getJobListings(userId: string, filters: DiscoveryFilters = {}, limit: number = 10) {
    try {
      // For demo purposes, create mock job listings from our candidates
      const mockJobs = mockFrontendCandidates.slice(0, limit).map((candidate, index) => ({
        id: `job-${index + 1}`,
        title: `${candidate.title} Position`,
        description: `Join our team as a ${candidate.title}. We're looking for someone with expertise in ${candidate.skills.slice(0, 3).join(', ')}.`,
        business_profiles: {
          company_name: ['TechCorp', 'InnovateLabs', 'DevStudio', 'CodeCraft', 'FutureWeb'][index % 5],
          location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'][index % 5],
          industry: 'Technology'
        },
        top_skills: candidate.skills.slice(0, 5),
        location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'][index % 5]
      }));

      return mockJobs;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      return [];
    }
  }
};