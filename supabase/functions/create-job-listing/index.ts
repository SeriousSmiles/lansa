import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { requireRole, formatAuthError } from '../_shared/guard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toSnakeCase(str: string): string {
  return str.toLowerCase().replace(/[\s-]/g, '_');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Guard: Require employer role and completed onboarding
    const authState = await requireRole(supabase, ['employer']);
    console.log('Authorized employer creating job:', authState.userId);

    const {
      company_id,
      title,
      description,
      category,
      job_type,
      target_user_types = [],
      image_url,
      skills_required = [],
      location,
      salary_range,
      is_remote = false,
      expires_at,
    } = await req.json();

    // Validate required fields
    if (!company_id || !title || !description || !category || !job_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize job_type to snake_case
    const normalizedJobType = toSnakeCase(job_type);
    const validJobTypes = ['full_time', 'part_time', 'contract', 'internship'];
    if (!validJobTypes.includes(normalizedJobType)) {
      return new Response(
        JSON.stringify({ error: `Invalid job_type. Must be one of: ${validJobTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating job listing for user ${authState.userId}`);

    // Insert job listing
    const { data: job, error: jobError } = await supabase
      .from('job_listings_v2')
      .insert({
        company_id,
        title,
        description,
        category,
        job_type: normalizedJobType,
        target_user_types,
        image_url,
        skills_required,
        location,
        salary_range,
        is_remote,
        expires_at,
        created_by: authState.userId,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    console.log('Job created:', job.id);

    // Insert job skills
    if (skills_required.length > 0) {
      const skillRows = skills_required.map((skill: string) => ({
        job_id: job.id,
        skill_name: skill,
      }));

      const { error: skillsError } = await supabase
        .from('job_skills')
        .insert(skillRows);

      if (skillsError) {
        console.error('Error inserting skills:', skillsError);
        // Continue anyway - job is created
      }
    }

    return new Response(
      JSON.stringify({ success: true, job }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-job-listing:', error);
    return formatAuthError(error);
  }
});
