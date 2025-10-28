import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getAuthenticatedUser, formatAuthError, AuthorizationError } from '../_shared/guard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const state = await getAuthenticatedUser(supabase);
    const { token }: AcceptInvitationRequest = await req.json();

    console.log(`[accept-org-invitation] User ${state.userId} accepting invitation with token ${token}`);

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      throw new AuthorizationError('Could not retrieve user email', 'unauthorized');
    }

    // Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*, organization:organizations(*)')
      .eq('token', token)
      .eq('email', user.email)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('organization_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({ error: 'This invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('organization_memberships')
      .select('id, is_active')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', state.userId)
      .maybeSingle();

    if (existingMember?.is_active) {
      return new Response(
        JSON.stringify({ error: 'You are already a member of this organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: invitation.organization_id,
        user_id: state.userId,
        role: invitation.role,
        is_active: true,
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
      })
      .select()
      .single();

    if (membershipError) {
      console.error('[accept-org-invitation] Error creating membership:', membershipError);
      throw membershipError;
    }

    // Update invitation status
    await supabase
      .from('organization_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    // Set user_type to employer if not set
    const { data: userAnswers } = await supabase
      .from('user_answers')
      .select('user_type')
      .eq('user_id', state.userId)
      .maybeSingle();

    if (!userAnswers?.user_type) {
      await supabase
        .from('user_answers')
        .upsert({
          user_id: state.userId,
          user_type: 'employer',
        });
    }

    console.log(`[accept-org-invitation] Membership created: ${membership.id}`);

    return new Response(
      JSON.stringify({ success: true, membership, organization: invitation.organization }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[accept-org-invitation] Error:', error);
    return formatAuthError(error);
  }
});
