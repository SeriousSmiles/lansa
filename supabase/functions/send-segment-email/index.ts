import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { sendSegmentChangeEmail } from '../_shared/emailService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SegmentChangePayload {
  user_id: string;
  old_segment: string | null;
  new_segment: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SegmentChangePayload = await req.json();
    console.log('[send-segment-email] Processing segment change:', payload);

    const { user_id, old_segment, new_segment } = payload;

    // Only send emails for meaningful transitions
    // Skip if: old is null (new user, they get welcome email elsewhere)
    // Skip if: same segment
    if (!old_segment || old_segment === new_segment) {
      console.log('[send-segment-email] Skipping - no meaningful transition');
      return new Response(
        JSON.stringify({ message: 'No email needed for this transition' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip purple transitions (they're already highly engaged)
    // Only send for transitions TO red or orange (need help)
    // Or FROM red to green/orange (positive progress)
    const shouldSendEmail = 
      new_segment === 'red' ||  // Drifting - re-engage
      new_segment === 'orange' || // Underused - encourage
      (old_segment === 'red' && (new_segment === 'green' || new_segment === 'orange')); // Recovery - celebrate

    if (!shouldSendEmail) {
      console.log('[send-segment-email] Skipping - transition not configured for email');
      return new Response(
        JSON.stringify({ message: 'Transition not configured for email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user details
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('[send-segment-email] Failed to fetch user profile:', profileError);
      throw new Error('User profile not found');
    }

    if (!profile.email) {
      console.log('[send-segment-email] User has no email, skipping');
      return new Response(
        JSON.stringify({ message: 'User has no email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send the email
    await sendSegmentChangeEmail({
      recipientName: profile.name || 'there',
      recipientEmail: profile.email,
      oldSegment: old_segment,
      newSegment: new_segment,
      dashboardUrl: 'https://lansa.app/dashboard'
    });

    console.log('[send-segment-email] Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Segment change email sent to ${profile.email}`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[send-segment-email] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
