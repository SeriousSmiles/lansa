import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
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

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const jobType = url.searchParams.get('jobType');
    const isRemote = url.searchParams.get('isRemote');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Get user type from user_answers table
    const { data: userAnswers } = await supabase
      .from('user_answers')
      .select('career_path, user_type')
      .eq('user_id', user.id)
      .single();

    const userType = userAnswers?.career_path || userAnswers?.user_type || 'student';

    // Build query
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        business_profiles!inner(
          company_name,
          industry,
          location,
          website
        ),
        job_applications!left(
          id,
          status,
          created_at
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    // Filter by target user types
    if (userType) {
      query = query.contains('target_user_types', [userType]);
    }

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (jobType && jobType !== 'all') {
      query = query.eq('job_type', jobType);
    }

    if (isRemote === 'true') {
      query = query.eq('is_remote', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    // Filter to only show user's own applications
    const jobsWithApplications = jobs?.map(job => ({
      ...job,
      job_applications: job.job_applications?.filter(
        (app: any) => app && typeof app === 'object'
      ) || []
    })) || [];

    return new Response(
      JSON.stringify({
        jobs: jobsWithApplications,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-job-feed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
