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

  async getApplicantProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching applicant profile:', error);
      throw new Error('Failed to fetch applicant profile');
    }

    // Transform to DiscoveryProfile format
    return {
      user_id: data.user_id,
      name: data.name || 'Professional',
      title: data.title || 'Seeking Opportunities',
      about_text: data.about_text,
      profile_image: data.profile_image,
      skills: Array.isArray(data.skills) 
        ? data.skills.map((skill: any) => typeof skill === 'string' ? skill : skill?.name || skill)
        : [],
      cover_color: data.cover_color,
      highlight_color: data.highlight_color || '#FF6B4A',
      professional_goal: data.professional_goal,
      location: data.location,
      experiences: Array.isArray(data.experiences)
        ? data.experiences.slice(0, 3).map((exp: any) => ({
            title: exp.title || exp.role,
            subtitle: exp.subtitle || exp.company || '',
            description: exp.description || '',
            period: exp.period || `${exp.startYear || ''} - ${exp.endYear || 'Present'}`
          }))
        : [],
      education: Array.isArray(data.education)
        ? data.education.slice(0, 2).map((edu: any) => ({
            title: edu.title || edu.degree,
            description: edu.description || edu.institution,
            period: edu.period || `${edu.startYear || ''} - ${edu.endYear || 'Present'}`
          }))
        : [],
      languages: Array.isArray(data.languages)
        ? data.languages.map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean)
        : [],
      achievements: []
    };
  },
};
