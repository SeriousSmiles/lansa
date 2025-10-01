import { supabase } from "@/integrations/supabase/client";

export interface LearningJobListing {
  id: string;
  title: string;
  description: string;
  category: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  target_user_types: string[];
  image_url?: string;
  skills_required: string[];
  location?: string;
  salary_range?: string;
  is_remote: boolean;
  posted_at: string;
  expires_at?: string;
  is_active: boolean;
  companies?: {
    name: string;
    logo_url?: string;
    industry?: string;
    location?: string;
  };
  recommendation_score?: number;
  recommendation_reason?: string;
}

export interface LearningFeedResponse {
  jobs: LearningJobListing[];
  teaser: boolean;
  total: number;
  has_recommendations: boolean;
}

export interface LearningFeedFilters {
  cursor?: string;
  limit?: number;
  categories?: string[];
  job_types?: string[];
  remote_only?: boolean;
  search?: string;
}

export const learningJobFeedService = {
  async fetchJobs(filters: LearningFeedFilters = {}): Promise<LearningFeedResponse> {
    const { data, error } = await supabase.functions.invoke('fetch-learning-job-feed', {
      body: {
        cursor: filters.cursor,
        limit: filters.limit || 20,
        categories: filters.categories || [],
        job_types: filters.job_types || [],
        remote_only: filters.remote_only,
        search: filters.search,
      },
    });

    if (error) {
      console.error('Error fetching learning job feed:', error);
      throw error;
    }

    return data;
  },

  async recordInteraction(jobId: string, interaction: 'view' | 'save' | 'apply' | 'ignore' | 'share'): Promise<void> {
    const { error } = await supabase.functions.invoke('record-interaction', {
      body: {
        job_id: jobId,
        interaction,
      },
    });

    if (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  },

  async applyForJob(jobId: string, coverNote?: string): Promise<{ success: boolean; application_id: string }> {
    const { data, error } = await supabase.functions.invoke('apply-for-job-v2', {
      body: {
        job_id: jobId,
        cover_note: coverNote,
      },
    });

    if (error) {
      console.error('Error applying for job:', error);
      throw error;
    }

    return data;
  },

  prettifyJobType(jobType: string): string {
    const typeMap: Record<string, string> = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
    };
    return typeMap[jobType] || jobType;
  },
};
