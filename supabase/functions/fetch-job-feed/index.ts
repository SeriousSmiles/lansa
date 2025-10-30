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

    console.log('Fetching job feed for user:', user.id);

    // Parse filters from request body or query params
    const url = new URL(req.url);
    let category = url.searchParams.get('category');
    let jobType = url.searchParams.get('jobType');
    let isRemote = url.searchParams.get('isRemote');
    let search = url.searchParams.get('search');
    let page = parseInt(url.searchParams.get('page') || '1');
    let limit = parseInt(url.searchParams.get('limit') || '20');

    // Try to parse from body if POST
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        category = body.category || category;
        jobType = body.jobType || jobType;
        isRemote = body.isRemote !== undefined ? String(body.isRemote) : isRemote;
        search = body.search || search;
        page = body.page || page;
        limit = body.limit || limit;
      } catch (e) {
        // Body parsing failed, use query params
      }
    }

    // Get user type from user_answers table
    const { data: userAnswers } = await supabase
      .from('user_answers')
      .select('career_path, user_type')
      .eq('user_id', user.id)
      .maybeSingle();

    const userType = userAnswers?.career_path || userAnswers?.user_type || 'student';
    console.log('User type:', userType);

    // Check if user is certified and has preferences
    const { data: certData } = await supabase
      .from('user_certifications')
      .select('lansa_certified, verified')
      .eq('user_id', user.id)
      .maybeSingle();

    const isCertified = certData?.lansa_certified && certData?.verified;
    console.log('User certified:', isCertified);

    let userPreferences = null;
    if (isCertified) {
      const { data: prefData } = await supabase
        .from('user_job_preferences')
        .select('categories, job_types, is_remote_preferred, filtering_mode')
        .eq('user_id', user.id)
        .maybeSingle();
      
      userPreferences = prefData;
      console.log('User preferences:', userPreferences);
    }

    // Build query - LEFT join so jobs without business profiles still show
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        business_profiles(
          company_name,
          industry,
          location,
          website,
          organization_id,
          organizations(
            logo_url,
            name
          )
        ),
        job_applications!left(
          id,
          status,
          created_at
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // Apply user preferences if certified and in strict mode
    if (isCertified && userPreferences && userPreferences.filtering_mode === 'strict') {
      console.log('Applying strict filtering based on preferences');
      
      // Filter by preferred categories
      if (userPreferences.categories && userPreferences.categories.length > 0) {
        query = query.overlaps('target_user_types', userPreferences.categories);
      }
      
      // Filter by preferred job types
      if (userPreferences.job_types && userPreferences.job_types.length > 0) {
        const jobTypeFilters = userPreferences.job_types.map((jt: string) => 
          `job_type.eq.${jt.toLowerCase().replace('-', '_')}`
        ).join(',');
        query = query.or(jobTypeFilters);
      }
      
      // Filter by remote preference
      if (userPreferences.is_remote_preferred) {
        query = query.eq('is_remote', true);
      }
    } else {
      // Lite mode or not certified - show relevant jobs for user type
      console.log('Applying lite filtering or no preferences');
      if (userType) {
        // Show jobs that target this user type OR have no specific target
        query = query.or(`target_user_types.cs.{${userType}},target_user_types.is.null`);
      }
    }

    // Apply manual filters (override preferences)
    if (category && category !== 'all') {
      console.log('Filtering by category:', category);
      query = query.eq('category', category);
    }

    if (jobType && jobType !== 'all') {
      console.log('Filtering by job type:', jobType);
      query = query.eq('job_type', jobType);
    }

    if (isRemote === 'true') {
      console.log('Filtering remote jobs only');
      query = query.eq('is_remote', true);
    }

    if (search) {
      console.log('Searching for:', search);
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination and order
    query = query.order('created_at', { ascending: false });
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('Executing query...');
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
