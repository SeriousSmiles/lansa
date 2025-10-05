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
  achievements?: Array<{
    type: string;
    title: string;
    description: string;
    isFeatured: boolean;
  }>;
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
      // Try to fetch from user_profiles_public table for real data
      const { data: publicProfiles, error } = await supabase
        .from('user_profiles_public')
        .select('*')
        .limit(limit);

      if (publicProfiles && publicProfiles.length > 0) {
        // Convert database records to DiscoveryProfile format
        const discoveryProfiles: DiscoveryProfile[] = publicProfiles.map(profile => ({
          user_id: profile.user_id,
          name: profile.name || 'Professional',
          title: profile.title || 'Seeking Opportunities',
          about_text: profile.about_text,
          profile_image: profile.profile_image,
          skills: profile.skills || [],
          cover_color: profile.cover_color,
          highlight_color: profile.highlight_color || '#FF6B4A',
          professional_goal: profile.professional_goal,
          achievements: Array.isArray(profile.achievements) 
            ? profile.achievements
                .filter((a: any) => a.is_featured)
                .slice(0, 3)
                .map((a: any) => ({
                  type: a.type,
                  title: a.title,
                  description: a.description,
                  isFeatured: a.is_featured,
                }))
            : []
        }));

        // Apply skill filtering if provided
        let filteredProfiles = discoveryProfiles;
        if (filters.skills && filters.skills.length > 0) {
          filteredProfiles = discoveryProfiles.filter(profile =>
            filters.skills!.some(skill => 
              profile.skills.some(profileSkill => 
                profileSkill.toLowerCase().includes(skill.toLowerCase())
              )
            )
          );
        }

        return filteredProfiles;
      }

      // Fallback to mock data if no public profiles
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
      // Return mock data on error
      const shuffled = [...mockFrontendCandidates].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
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