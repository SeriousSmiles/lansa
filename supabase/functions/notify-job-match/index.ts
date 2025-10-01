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

    const { application_id } = await req.json();

    if (!application_id) {
      return new Response(
        JSON.stringify({ error: 'application_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing match notification for application ${application_id}`);

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('job_applications_v2')
      .select(`
        *,
        job_listings_v2!inner(
          id,
          title,
          created_by
        )
      `)
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if both parties have accepted
    if (application.status !== 'accepted') {
      return new Response(
        JSON.stringify({ message: 'Application not in accepted status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const applicantId = application.applicant_user_id;
    const recruiterId = application.job_listings_v2.created_by;

    console.log(`Creating match between ${applicantId} and ${recruiterId}`);

    // Create a match record (using existing matches table)
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user_a: applicantId,
        user_b: recruiterId,
        context: 'job_application',
        job_listing_id: application.job_id,
      })
      .select()
      .single();

    if (matchError) {
      // Match might already exist, which is fine
      console.log('Match creation note:', matchError.message);
    } else {
      console.log('Match created:', match?.id);
    }

    // Create notification records (if you have a notifications table)
    // This is optional - you can implement this based on your notification system

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Match notification processed',
        match_created: !!match,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in notify-job-match:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
