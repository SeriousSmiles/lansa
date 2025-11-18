/**
 * Match Summary Service
 * Handles AI-powered match summary generation for candidate-employer compatibility
 */

import { supabase } from '@/integrations/supabase/client';
import { DiscoveryProfile } from './discoveryService';

// Cache summaries to avoid redundant API calls
const summaryCache = new Map<string, { summary: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const matchSummaryService = {
  /**
   * Get AI-powered match summary for a candidate
   */
  async getMatchSummary(
    employerId: string,
    candidateProfile: DiscoveryProfile
  ): Promise<string> {
    const cacheKey = `${employerId}-${candidateProfile.user_id}`;
    
    // Check cache first
    const cached = summaryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.summary;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-match-summary', {
        body: {
          employerId,
          candidateProfile: {
            user_id: candidateProfile.user_id,
            name: candidateProfile.name,
            title: candidateProfile.title,
            location: candidateProfile.location,
            skills: candidateProfile.skills,
            experiences: candidateProfile.experiences,
            professional_goal: candidateProfile.professional_goal,
            about_text: candidateProfile.about_text,
          },
        },
      });

      if (error) {
        console.error('Failed to generate match summary:', error);
        throw error;
      }

      const summary = data?.summary || this.generateFallbackSummary(candidateProfile);
      
      // Cache the result
      summaryCache.set(cacheKey, {
        summary,
        timestamp: Date.now(),
      });

      return summary;
    } catch (error) {
      console.error('Error getting match summary:', error);
      return this.generateFallbackSummary(candidateProfile);
    }
  },

  /**
   * Generate a basic fallback summary if AI fails
   */
  generateFallbackSummary(profile: DiscoveryProfile): string {
    const skills = profile.skills?.slice(0, 3).join(', ') || 'various skills';
    const location = profile.location ? ` based in ${profile.location}` : '';
    const experience = profile.experiences?.[0]?.title || 'professional experience';
    
    return `This Lansa-certified professional${location} brings strong expertise in ${skills}. With a background in ${experience}, they demonstrate the readiness and capability to contribute effectively to your team.`;
  },

  /**
   * Clear cache for a specific match
   */
  clearCache(employerId: string, candidateId: string): void {
    const cacheKey = `${employerId}-${candidateId}`;
    summaryCache.delete(cacheKey);
  },

  /**
   * Clear all cached summaries
   */
  clearAllCache(): void {
    summaryCache.clear();
  },
};
