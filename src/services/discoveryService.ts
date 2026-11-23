import { supabase } from "@/integrations/supabase/client";
import { SwipeContext } from "./swipeService";

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
    certifiedOnly: boolean = false,
    strictErrors: boolean = false
  ): Promise<DiscoveryProfile[]> {
    try {
      // Step 1: Fetch already-swiped candidate IDs to exclude them
      const { data: swipeHistory, error: historyError } = await supabase
        .from('swipes')
        .select('target_user_id')
        .eq('swiper_user_id', userId)
        .eq('context', context);

      if (strictErrors && historyError) throw historyError;
      const swipedIds = swipeHistory?.map(s => s.target_user_id) || [];

      // Mobile scans a stable, bounded page at a time before applying the display limit.
      // Otherwise uncertified or non-matching rows in the first page can create a false empty state.
      const certifiedUserIds = new Set<string>();
      const loadCertifications = async () => {
        let offset = 0;
        do {
          let certQuery = supabase.from('user_certifications').select('user_id, lansa_certified, verified').eq('lansa_certified', true).eq('verified', true);
          if (strictErrors) certQuery = certQuery.order('user_id').range(offset, offset + 199);
          const { data, error } = await certQuery;
          if (error) { if (strictErrors) throw error; console.error('Error fetching certifications:', error); return; }
          data?.forEach(cert => certifiedUserIds.add(cert.user_id));
          if (!strictErrors || !data || data.length < 200) break;
          offset += 200;
        } while (true);
      };
      if (strictErrors) await loadCertifications();
      const makeQuery = () => {
        let query = supabase.from('user_profiles_public').select('*').neq('user_id', userId);
        if (swipedIds.length) query = query.not('user_id', 'in', `(${swipedIds.join(',')})`);
        return query;
      };
      const first = await (strictErrors ? makeQuery().order('user_id').range(0, 99) : makeQuery().limit(limit));
      if (first.error) throw first.error;
      const publicProfiles = [...(first.data || [])];
      if (strictErrors) {
        let batchLength = first.data?.length || 0;
        let offset = 100;
        const requestedSkills = filters.skills || [];
        const isEligible = (profile: typeof publicProfiles[number]) => {
          if (!profile.name?.trim() || (certifiedOnly && !certifiedUserIds.has(profile.user_id))) return false;
          if (!requestedSkills.length) return true;
          const skills: unknown[] = Array.isArray(profile.skills) ? profile.skills : [];
          return requestedSkills.some(skill => skills.some(value => {
            const name = typeof value === 'string' ? value : value && typeof value === 'object' && 'name' in value ? value.name : null;
            return typeof name === 'string' && name.toLowerCase().includes(skill.toLowerCase());
          }));
        };
        while (batchLength === 100 && publicProfiles.filter(isEligible).length < limit) {
          const batch = await makeQuery().order('user_id').range(offset, offset + 99);
          if (batch.error) throw batch.error;
          publicProfiles.push(...(batch.data || []));
          batchLength = batch.data?.length || 0;
          offset += 100;
        }
      }
      if (!publicProfiles.length) return [];
      if (!strictErrors) await loadCertifications();
      {
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
                  .slice(0, strictErrors ? undefined : 3)
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

        // Apply skill filtering if provided
        let filteredProfiles = discoveryProfiles;
        if (filters.skills && filters.skills.length > 0) {
          filteredProfiles = discoveryProfiles.filter(profile =>
            (filters.skills || []).some(skill => 
              profile.skills.some(profileSkill => 
                typeof profileSkill === 'string' && profileSkill.toLowerCase().includes(skill.toLowerCase())
              )
            )
          );
        }

        return strictErrors ? filteredProfiles.slice(0, limit) : filteredProfiles;
      }

      return [];
    } catch (error) {
      console.error('Error fetching discovery profiles:', error);
      if (strictErrors) throw error;
      return [];
    }
  },

  async getJobListings(_userId: string, _filters: DiscoveryFilters = {}, _limit: number = 10) {
    try {
      const mockJobs: never[] = [];
      return mockJobs;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      return [];
    }
  }
};
