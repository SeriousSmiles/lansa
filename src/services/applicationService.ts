import { supabase } from "@/integrations/supabase/client";

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  cover_note: string | null;
  created_at: string;
  updated_at: string;
  applicant: {
    user_id: string;
    name: string | null;
    profile_image: string | null;
    title: string | null;
  } | null;
}

export const applicationService = {
  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications_v2')
      .select(`
        *,
        applicant:user_profiles!job_applications_v2_applicant_user_id_fkey(
          user_id,
          name,
          profile_image,
          title
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    return data || [];
  },

  async updateApplicationStatus(
    applicationId: string,
    status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  ): Promise<void> {
    const { error } = await supabase
      .from('job_applications_v2')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  subscribeToApplications(jobId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`applications-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_applications_v2',
          filter: `job_id=eq.${jobId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
