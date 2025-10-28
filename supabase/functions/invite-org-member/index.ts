import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getAuthenticatedUser, formatAuthError, AuthorizationError } from '../_shared/guard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  organizationId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
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
    const { organizationId, email, role }: InviteRequest = await req.json();

    console.log(`[invite-org-member] User ${state.userId} inviting ${email} to org ${organizationId} as ${role}`);

    // Check if user has permission to invite (admin or owner)
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', state.userId)
      .eq('is_active', true)
      .single();

    if (membershipError || !membership) {
      throw new AuthorizationError('Not a member of this organization', 'forbidden');
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      throw new AuthorizationError('Insufficient permissions to invite members', 'forbidden');
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from('organization_memberships')
      .select('id, is_active')
      .eq('organization_id', organizationId)
      .eq('user_id', (await supabase.from('auth.users').select('id').eq('email', email).maybeSingle())?.data?.id || '')
      .maybeSingle();

    if (existingMember?.is_active) {
      return new Response(
        JSON.stringify({ error: 'User is already a member of this organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('organization_invitations')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      return new Response(
        JSON.stringify({ error: 'An invitation has already been sent to this email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: state.userId,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error('[invite-org-member] Error creating invitation:', inviteError);
      throw inviteError;
    }

    console.log(`[invite-org-member] Invitation created: ${invitation.id}`);

    // TODO: Send email notification (integrate with email service)

    return new Response(
      JSON.stringify({ success: true, invitation }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[invite-org-member] Error:', error);
    return formatAuthError(error);
  }
});
