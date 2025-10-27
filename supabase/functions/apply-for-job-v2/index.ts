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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { job_id, cover_note } = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} applying for job ${job_id}`);

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_listings_v2')
      .select('id, title, is_active, created_by')
      .eq('id', job_id)
      .maybeSingle();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!job.is_active) {
      return new Response(
        JSON.stringify({ error: 'Job is no longer active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('job_applications_v2')
      .select('id, status')
      .eq('job_id', job_id)
      .eq('applicant_user_id', user.id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: 'Already applied', 
          application_id: existing.id,
          status: existing.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert application
    const { data: application, error: insertError } = await supabase
      .from('job_applications_v2')
      .insert({
        job_id,
        applicant_user_id: user.id,
        cover_note,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating application:', insertError);
      
      // Handle duplicate key constraint error (race condition)
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'You have already applied to this job',
            code: 'ALREADY_APPLIED'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw insertError;
    }

    console.log('Application created:', application.id);

    // Record the apply interaction
    await supabase.from('job_interactions').insert({
      job_id,
      user_id: user.id,
      type: 'apply',
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        application_id: application.id,
        status: application.status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in apply-for-job-v2:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
