import { supabase } from "@/integrations/supabase/client";
import { JobListing } from "@/services/jobFeedService";

const CTX = 'job' as any; // enum value 'job' on match_context

export const savedJobsService = {
  async recordJobSwipe(opts: {
    swiperId: string;
    job: JobListing;
    direction: 'left' | 'right';
  }) {
    const target =
      (opts.job as any).created_by ||
      (opts.job as any).business_id ||
      opts.swiperId; // fallback so NOT NULL constraint passes

    const { error } = await supabase.from('swipes').insert({
      swiper_user_id: opts.swiperId,
      target_user_id: target,
      direction: opts.direction,
      context: CTX,
      job_listing_id: opts.job.id,
    } as any);
    if (error && (error as any).code !== '23505') {
      console.error('recordJobSwipe failed', error);
      throw error;
    }
  },

  async getSwipedJobIds(swiperId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('swipes')
      .select('job_listing_id')
      .eq('swiper_user_id', swiperId)
      .eq('context', CTX);
    if (error) {
      console.error('getSwipedJobIds failed', error);
      return [];
    }
    return (data || []).map((r: any) => r.job_listing_id).filter(Boolean);
  },

  async getSavedJobs(swiperId: string): Promise<JobListing[]> {
    const { data: swipes, error } = await supabase
      .from('swipes')
      .select('job_listing_id, created_at')
      .eq('swiper_user_id', swiperId)
      .eq('context', CTX)
      .eq('direction', 'right')
      .order('created_at', { ascending: false });

    if (error || !swipes?.length) return [];
    const ids = swipes.map((s: any) => s.job_listing_id).filter(Boolean);
    if (!ids.length) return [];

    const { data: jobs, error: jErr } = await supabase
      .from('job_listings_v2')
      .select(`
        id, title, description, location, category, job_type, is_remote,
        salary_range, image_url, skills_required, company_id, organization_id,
        created_at, is_active,
        companies(name, logo_url),
        organizations(name, logo_url)
      `)
      .in('id', ids);

    if (jErr || !jobs) return [];

    const byId = new Map<string, any>(jobs.map((j: any) => [j.id, j]));
    return ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((j: any): JobListing => ({
        id: j.id,
        business_id: j.company_id,
        title: j.title,
        description: j.description,
        location: j.location,
        top_skills: Array.isArray(j.skills_required) ? j.skills_required : [],
        mode: 'employee',
        is_active: j.is_active,
        created_at: j.created_at,
        updated_at: j.created_at,
        image_url: j.image_url,
        target_user_types: [],
        category: j.category,
        salary_range: j.salary_range,
        job_type: j.job_type,
        is_remote: j.is_remote,
        organization_id: j.organization_id,
        organizations: j.organizations || undefined,
        company_name: j.organizations?.name || j.companies?.name,
        logo_url: j.organizations?.logo_url || j.companies?.logo_url,
        business_profiles: {
          company_name: j.organizations?.name || j.companies?.name || 'Company',
          organizations: j.organizations || undefined,
        },
      }));
  },

  async removeSavedJob(swiperId: string, jobId: string) {
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('swiper_user_id', swiperId)
      .eq('context', CTX)
      .eq('job_listing_id', jobId);
    if (error) throw error;
  },

  async isJobSaved(swiperId: string, jobId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_user_id', swiperId)
      .eq('context', CTX)
      .eq('job_listing_id', jobId)
      .eq('direction', 'right')
      .maybeSingle();
    if (error) {
      console.error('isJobSaved failed', error);
      return false;
    }
    return !!data;
  },

  /**
   * Save a job to the "Interested" list — equivalent to a right swipe in the
   * mobile swipe deck. Idempotent: safe to call when already saved.
   */
  async saveJob(opts: {
    swiperId: string;
    job: Pick<JobListing, 'id'> & Partial<JobListing> & Record<string, any>;
  }) {
    const target =
      (opts.job as any).created_by ||
      (opts.job as any).business_id ||
      (opts.job as any).organization_id ||
      opts.swiperId;

    const { error } = await supabase.from('swipes').insert({
      swiper_user_id: opts.swiperId,
      target_user_id: target,
      direction: 'right',
      context: CTX,
      job_listing_id: opts.job.id,
    } as any);
    // 23505 = unique_violation → already saved, treat as success
    if (error && (error as any).code !== '23505') {
      console.error('saveJob failed', error);
      throw error;
    }
  },

  async undoLastSwipe(swiperId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('swipes')
      .select('id, job_listing_id')
      .eq('swiper_user_id', swiperId)
      .eq('context', CTX)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    await supabase.from('swipes').delete().eq('id', data.id);
    return data.job_listing_id ?? null;
  },
};