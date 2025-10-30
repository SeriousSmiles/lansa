import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { markOnboardingComplete } from '../_shared/onboardingHelper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('[backfill-employer-onboarding] Starting backfill...');

    // Find all employers with organization membership but missing onboarding flags
    const { data: employerUsers, error: queryError } = await supabaseAdmin
      .from('user_answers')
      .select('user_id, user_type, career_path_onboarding_completed')
      .eq('user_type', 'employer');

    if (queryError) {
      console.error('[backfill-employer-onboarding] Query error:', queryError);
      throw queryError;
    }

    const results = {
      fixed: 0,
      already_correct: 0,
      errors: [] as string[],
    };

    for (const user of employerUsers || []) {
      try {
        // Check if user has any organization membership (active or pending)
        const { data: membership } = await supabaseAdmin
          .from('organization_memberships')
          .select('id, is_active, organization_id')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (!membership) {
          console.log(`[backfill-employer-onboarding] User ${user.user_id} has no org membership, skipping`);
          continue;
        }

        // Check onboarding flags
        const { data: profileData } = await supabaseAdmin
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.user_id)
          .maybeSingle();

        const profileCompleted = profileData?.onboarding_completed ?? false;
        const legacyCompleted = user.career_path_onboarding_completed ?? false;

        if (!profileCompleted || !legacyCompleted) {
          console.log(`[backfill-employer-onboarding] Fixing user ${user.user_id}`);
          await markOnboardingComplete(supabaseAdmin, user.user_id, 'employer');
          results.fixed++;
        } else {
          results.already_correct++;
        }
      } catch (error) {
        console.error(`[backfill-employer-onboarding] Error fixing user ${user.user_id}:`, error);
        results.errors.push(`${user.user_id}: ${error.message}`);
      }
    }

    console.log('[backfill-employer-onboarding] Backfill complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[backfill-employer-onboarding] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
