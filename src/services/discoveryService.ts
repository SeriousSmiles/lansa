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
  biggest_challenge?: string;
  location?: string;
  isCertified?: boolean;
  experiences?: Array<{
    title: string;
    subtitle: string;
    description: string;
    period: string;
  }>;
  education?: Array<{
    title: string;
    description: string;
    period: string;
  }>;
  languages?: string[];
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
    limit: number = 10,
    certifiedOnly: boolean = false
  ): Promise<DiscoveryProfile[]> {
    try {
      // Fetch profiles from public view
      console.log('Fetching profiles from user_profiles_public, certifiedOnly:', certifiedOnly);
      
      const { data: publicProfiles, error } = await supabase
        .from('user_profiles_public')
        .select('*')
        .limit(limit);

      console.log('Query result:', { data: publicProfiles, error });

      if (error) {
        console.error('Error fetching discovery profiles:', error);
        throw new Error(`Failed to fetch candidates: ${error.message}`);
      }

      if (!publicProfiles || publicProfiles.length === 0) {
        console.log('No profiles returned from user_profiles_public');
        const errorMessage = certifiedOnly 
          ? 'No certified candidates found. All available certified professionals have been reviewed.'
          : 'No candidates found matching your criteria.';
        console.log(errorMessage);
        return [];
      }

      if (publicProfiles && publicProfiles.length > 0) {
        // Always fetch certification data so we can show badges
        let certifiedUserIds: Set<string> = new Set();
        {
          const { data: certifications, error: certError } = await supabase
            .from('user_certifications')
            .select('user_id, lansa_certified, verified')
            .eq('lansa_certified', true)
            .eq('verified', true);

          if (certError) {
            console.error('Error fetching certifications:', certError);
          } else if (certifications) {
            certifiedUserIds = new Set(certifications.map(cert => cert.user_id));
          }
        }

        // Convert database records to DiscoveryProfile format
        const discoveryProfiles: DiscoveryProfile[] = publicProfiles
          .filter(profile => {
            // Quality filter: skip blank/whitespace-only names
            if (!profile.name || !profile.name.trim()) return false;
            // Apply certification filter at application level
            if (certifiedOnly) {
              return certifiedUserIds.has(profile.user_id);
            }
            return true;
          })
          .map(profile => ({
            user_id: profile.user_id,
            name: profile.name || 'Professional',
            title: profile.title || 'Seeking Opportunities',
            about_text: profile.about_text,
            profile_image: profile.profile_image,
            skills: Array.isArray(profile.skills) 
              ? profile.skills.map((skill: any) => 
                  typeof skill === 'string' ? skill : skill?.name || skill
                )
              : [],
            cover_color: profile.cover_color,
            highlight_color: profile.highlight_color || '#FF6B4A',
            professional_goal: profile.professional_goal,
            biggest_challenge: profile.biggest_challenge,
            location: profile.location,
            isCertified: certifiedOnly ? true : certifiedUserIds.has(profile.user_id),
            experiences: Array.isArray(profile.experiences)
              ? profile.experiences
                  .slice(0, 3)
                  .map((exp: any) => ({
                    title: exp.title || '',
                    subtitle: exp.company || '',
                    description: exp.description || '',
                    period: `${exp.startYear || ''} - ${exp.endYear || 'Present'}`
                  }))
              : [],
            education: Array.isArray(profile.education)
              ? profile.education
                  .map((edu: any) => ({
                    title: edu.title || '',
                    description: edu.description || '',
                    period: `${edu.startYear || ''} - ${edu.endYear || 'Present'}`
                  }))
              : [],
            languages: Array.isArray(profile.languages)
              ? profile.languages.map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean)
              : [],
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

        console.log(`After certification filter: ${discoveryProfiles.length} profiles`);

        // If certifiedOnly mode returns 0 candidates, use mock data as placeholder
        if (certifiedOnly && discoveryProfiles.length === 0) {
          console.log('No certified candidates found, using placeholder candidates');
          const mockWithCertification = mockFrontendCandidates.map(mock => ({
            ...mock,
            isCertified: true
          }));
          const shuffled = mockWithCertification.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, limit);
        }

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