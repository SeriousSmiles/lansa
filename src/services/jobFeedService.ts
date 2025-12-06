import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobListing {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  location?: string;
  top_skills: string[];
  mode: 'employee' | 'internship';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  job_image?: string;
  image_url?: string;
  target_user_types: string[];
  category?: string;
  expires_at?: string;
  salary_range?: string;
  job_type?: string;
  is_remote: boolean;
  organization_id?: string;
  logo_url?: string;
  company_name?: string;
  organizations?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  business_profiles?: {
    company_name: string;
    industry?: string;
    location?: string;
    website?: string;
    organization_id?: string;
    organizations?: {
      logo_url?: string;
      name: string;
    };
  };
  job_applications?: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

export interface JobFeedFilters {
  category?: string;
  jobType?: string;
  isRemote?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JobFeedResponse {
  jobs: JobListing[];
  total: number;
  page: number;
  totalPages: number;
}

export const jobFeedService = {
  async fetchJobs(filters: JobFeedFilters = {}): Promise<JobFeedResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-job-feed', {
        body: filters,
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching job feed:', error);
      toast.error("Failed to load job opportunities");
      return { jobs: [], total: 0, page: 1, totalPages: 0 };
    }
  },

  async applyForJob(jobId: string, coverNote?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('apply-for-job-v2', {
        body: { jobId, coverNote },
      });

      if (error) {
        if (error.message?.includes('Already applied')) {
          toast.info("You've already applied for this position");
          return false;
        }
        throw error;
      }

      toast.success("Application submitted successfully!");
      return true;
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error("Failed to submit application");
      return false;
    }
  },

  async getMyApplications(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Query job_applications_v2 with job_listings_v2 and companies
      const { data, error } = await supabase
        .from('job_applications_v2')
        .select(`
          id,
          status,
          created_at,
          cover_note,
          job_id,
          job_listings_v2!inner(
            id,
            title,
            description,
            location,
            category,
            job_type,
            is_remote,
            salary_range,
            company_id,
            organization_id,
            companies(
              name,
              logo_url
            ),
            organizations(
              name,
              logo_url
            )
          )
        `)
        .eq('applicant_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to expected format
      return (data || []).map((app: any) => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        cover_note: app.cover_note,
        job: {
          id: app.job_listings_v2.id,
          title: app.job_listings_v2.title,
          description: app.job_listings_v2.description,
          location: app.job_listings_v2.location,
          category: app.job_listings_v2.category,
          job_type: app.job_listings_v2.job_type,
          is_remote: app.job_listings_v2.is_remote,
          salary_range: app.job_listings_v2.salary_range,
          company_name: app.job_listings_v2.organizations?.name || app.job_listings_v2.companies?.name || 'Unknown Company',
          company_logo: app.job_listings_v2.organizations?.logo_url || app.job_listings_v2.companies?.logo_url,
        }
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  },

  async withdrawApplication(applicationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_applications_v2')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success("Application withdrawn");
      return true;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error("Failed to withdraw application");
      return false;
    }
  }
};
