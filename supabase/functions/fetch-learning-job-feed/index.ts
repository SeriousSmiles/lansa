import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toSnakeJobType(jt?: string): string | null {
  if (!jt) return null;
  return jt.toLowerCase().replace(/[\s-]/g, '_');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching learning feed for user:', user.id);

    // Parse request
    const { cursor, limit = 20, categories = [], job_types = [], remote_only, search } = await req.json();

    // Load user profile once
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, career_path')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('User profile:', profile);

    // Check certification status from user_certifications table
    const { data: certification } = await supabase
      .from('user_certifications')
      .select('lansa_certified, verified')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('User certification:', certification);

    const isCertified = certification?.lansa_certified === true && certification?.verified === true;

    // Load user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('categories, job_types, remote_only')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('User preferences:', prefs);

    // Effective filters (request overrides preferences)
    const effectiveCategories: string[] = categories.length > 0 ? categories : (prefs?.categories ?? []);
    const effectiveTypes: string[] = (job_types.length > 0 ? job_types : (prefs?.job_types ?? []))
      .map(toSnakeJobType)
      .filter(Boolean) as string[];
    const remoteFlag = remote_only ?? prefs?.remote_only ?? false;

    console.log('Effective filters:', { effectiveCategories, effectiveTypes, remoteFlag });

    // Base query on job_listings_v2
    let query = supabase
      .from('job_listings_v2')
      .select(`
        *,
        companies(name, logo_url, industry, location)
      `)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // Search filter
    if (search && search.trim().length > 1) {
      query = query.textSearch('search_tsv', search.trim(), { config: 'english' });
    }

    // Category filter (correct dimension)
    if (effectiveCategories.length > 0) {
      query = query.in('category', effectiveCategories);
    }

    // Job type filter
    if (effectiveTypes.length > 0) {
      query = query.in('job_type', effectiveTypes);
    }

    // Remote filter
    if (remoteFlag === true) {
      query = query.eq('is_remote', true);
    }

    // Gate by target_user_types when specified
    if (profile?.career_path) {
      // Show jobs that target this user type OR have no specific target
      query = query.or(`target_user_types.cs.{${profile.career_path}},target_user_types.eq.[]`);
    }

    // Fetch batch
    const { data: jobs, error: jobsError } = await query
      .order('posted_at', { ascending: false })
      .limit(100);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      throw jobsError;
    }

    console.log(`Fetched ${jobs?.length || 0} jobs before ordering`);

    let orderedJobs = jobs || [];

    // Apply recommendation ordering if available
    const { data: recs } = await supabase
      .from('job_recommendations')
      .select('job_id, score, reason')
      .eq('user_id', user.id)
      .order('score', { ascending: false })
      .limit(500);

    if (recs && recs.length > 0) {
      console.log(`Found ${recs.length} recommendations for user`);
      const scoreMap = new Map(recs.map(r => [r.job_id, { score: r.score, reason: r.reason }]));
      
      orderedJobs = orderedJobs.map(job => ({
        ...job,
        recommendation_score: scoreMap.get(job.id)?.score || 0,
        recommendation_reason: scoreMap.get(job.id)?.reason,
      }));

      orderedJobs.sort((a, b) => 
        (b.recommendation_score - a.recommendation_score) || 
        (new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
      );
    }

    // Certification teaser gating
    let teaser = false;
    if (!isCertified) {
      console.log('User not certified, limiting to 5 jobs with teaser');
      teaser = true;
      orderedJobs = orderedJobs.slice(0, 5);
    }

    // Apply pagination
    const paginatedJobs = orderedJobs.slice(0, limit);

    // Get user's application statuses for these jobs
    const jobIds = paginatedJobs.map(j => j.id);
    const { data: userApps } = await supabase
      .from('job_applications_v2')
      .select('job_id, status, created_at')
      .eq('applicant_user_id', user.id)
      .in('job_id', jobIds);

    const appMap = new Map(userApps?.map(a => [a.job_id, a]) || []);

    const jobsWithStatus = paginatedJobs.map(job => ({
      ...job,
      user_application_status: appMap.get(job.id)?.status || null,
      user_applied_at: appMap.get(job.id)?.created_at || null,
    }));

    console.log(`Returning ${jobsWithStatus.length} jobs, teaser: ${teaser}`);

    return new Response(
      JSON.stringify({
        jobs: jobsWithStatus,
        teaser,
        total: orderedJobs.length,
        has_recommendations: (recs?.length || 0) > 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-learning-job-feed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
