import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getAuthenticatedUser, formatAuthError, AuthorizationError } from '../_shared/guard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageRequestBody {
  membershipId: string;
  action: 'approve' | 'reject';
  role?: 'admin' | 'manager' | 'member' | 'viewer';
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
    const { membershipId, action, role }: ManageRequestBody = await req.json();

    console.log(`[manage-org-request] User ${state.userId} ${action}ing request ${membershipId}`);

    // Get the membership request
    const { data: request, error: requestError } = await supabase
      .from('organization_memberships')
      .select('*, organization:organizations(*)')
      .eq('id', membershipId)
      .eq('is_active', false)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to manage requests (admin or owner)
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', request.organization_id)
      .eq('user_id', state.userId)
      .eq('is_active', true)
      .single();

    if (membershipError || !membership) {
      throw new AuthorizationError('Not a member of this organization', 'forbidden');
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      throw new AuthorizationError('Insufficient permissions to manage requests', 'forbidden');
    }

    if (action === 'approve') {
      // Check seat limit
      const { data: org } = await supabase
        .from('organizations')
        .select('seat_limit')
        .eq('id', request.organization_id)
        .single();

      const { count: activeCount } = await supabase
        .from('organization_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', request.organization_id)
        .eq('is_active', true);

      if (org?.seat_limit && activeCount && activeCount >= org.seat_limit) {
        return new Response(
          JSON.stringify({ error: 'Organization has reached seat limit. Please upgrade your plan.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Approve request
      const { error: updateError } = await supabase
        .from('organization_memberships')
        .update({
          is_active: true,
          role: role || 'member',
          joined_at: new Date().toISOString(),
        })
        .eq('id', membershipId);

      if (updateError) {
        console.error('[manage-org-request] Error approving request:', updateError);
        throw updateError;
      }

      // Set user_type to employer
      await supabase
        .from('user_answers')
        .upsert({
          user_id: request.user_id,
          user_type: 'employer',
        });

      console.log(`[manage-org-request] Request approved: ${membershipId}`);

      return new Response(
        JSON.stringify({ success: true, action: 'approved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Reject request - delete it
      const { error: deleteError } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', membershipId);

      if (deleteError) {
        console.error('[manage-org-request] Error rejecting request:', deleteError);
        throw deleteError;
      }

      console.log(`[manage-org-request] Request rejected: ${membershipId}`);

      return new Response(
        JSON.stringify({ success: true, action: 'rejected' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[manage-org-request] Error:', error);
    return formatAuthError(error);
  }
});
