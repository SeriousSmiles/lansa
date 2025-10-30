import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getAuthenticatedUser, formatAuthError, AuthorizationError } from '../_shared/guard.ts';
import { requireOrgRole } from '../_shared/orgPermissions.ts';
import { sendApprovalEmail, sendRejectionEmail } from '../_shared/emailService.ts';
import { createNotification } from '../_shared/notificationHelper.ts';
import { rateLimit } from '../_shared/rateLimit.ts';
import { markOnboardingComplete } from '../_shared/onboardingHelper.ts';

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

  // Rate limiting
  const rateLimitResult = await rateLimit(req, { limit: 20, window: 60 });
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter 
      }),
      { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Create service role client for bypassing RLS when updating user profiles
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const state = await getAuthenticatedUser(supabase);
    const { membershipId, action, role }: ManageRequestBody = await req.json();

    console.log(`[manage-org-request] User ${state.userId} ${action}ing request ${membershipId}`);

    // First check if membership exists at all
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('*, organization:organizations(*)')
      .eq('id', membershipId)
      .maybeSingle();

    if (membershipError) {
      console.error('[manage-org-request] Error fetching membership:', membershipError);
      throw membershipError;
    }

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already approved, check if onboarding flags need backfilling
    if (membership.is_active) {
      console.log('[manage-org-request] Request already approved, checking onboarding flags...');
      
      // Check if onboarding flags are set
      const [profileResult, answersResult] = await Promise.all([
        supabaseAdmin
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', membership.user_id)
          .maybeSingle(),
        supabaseAdmin
          .from('user_answers')
          .select('career_path_onboarding_completed')
          .eq('user_id', membership.user_id)
          .maybeSingle()
      ]);

      const profileCompleted = profileResult.data?.onboarding_completed ?? false;
      const legacyCompleted = answersResult.data?.career_path_onboarding_completed ?? false;

      let backfilled = false;
      if (!profileCompleted || !legacyCompleted) {
        console.log('[manage-org-request] Backfilling missing onboarding flags...');
        await markOnboardingComplete(supabaseAdmin, membership.user_id, 'employer');
        backfilled = true;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Request already approved',
          status: 'already_approved',
          backfilled,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const request = membership;

    // Check permission using new permission system
    await requireOrgRole(supabase, state.userId, request.organization_id, ['owner', 'admin']);

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

      // Onboarding should already be complete (marked when request was sent)
      // But we'll check and backfill just in case
      const { data: profileData } = await supabaseAdmin
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', request.user_id)
        .maybeSingle();

      if (!profileData?.onboarding_completed) {
        console.log('[manage-org-request] Backfilling onboarding on approval...');
        await markOnboardingComplete(supabaseAdmin, request.user_id, 'employer');
      }

      console.log(`[manage-org-request] Request approved for user ${request.user_id}`);

      // Get user details for email
      const { data: userData } = await supabase.auth.admin.getUserById(request.user_id);
      const userName = userData.user?.user_metadata?.full_name || 
                      userData.user?.email?.split('@')[0] || 
                      'there';
      const userEmail = userData.user?.email;

      // Send approval email (non-blocking)
      if (userEmail) {
        try {
          await sendApprovalEmail(
            {
              organizationName: request.organization.name,
              recipientName: userName,
              role: role || 'member',
              dashboardUrl: 'https://lansa.app/employer-dashboard'
            },
            userEmail
          );
        } catch (emailError) {
          console.error('[manage-org-request] Approval email failed:', emailError);
        }
      }

      // Create in-app notification for the user
      try {
        await createNotification(supabaseAdmin, {
          userId: request.user_id,
          type: 'org_request_approved',
          title: 'Request Approved!',
          message: `Your request to join ${request.organization.name} has been approved as ${role || 'member'}.`,
          actionUrl: '/employer-dashboard',
          metadata: {
            organizationId: request.organization_id,
            organizationName: request.organization.name,
            role: role || 'member',
          },
        });
      } catch (notifError) {
        console.error('[manage-org-request] Failed to create notification:', notifError);
      }

      // Notify all org members about new member (except the actor)
      try {
        const { data: members } = await supabaseAdmin
          .from('organization_memberships')
          .select('user_id')
          .eq('organization_id', request.organization_id)
          .eq('is_active', true)
          .neq('user_id', state.userId); // Don't notify the admin who approved

        if (members && members.length > 0) {
          for (const member of members) {
            await createNotification(supabaseAdmin, {
              userId: member.user_id,
              type: 'org_member_joined',
              title: 'New Team Member',
              message: `${userName} has joined ${request.organization.name} as ${role || 'member'}.`,
              actionUrl: '/organization/settings',
              metadata: {
                organizationId: request.organization_id,
                newMemberId: request.user_id,
                newMemberName: userName,
              },
            });
          }
        }
      } catch (notifError) {
        console.error('[manage-org-request] Failed to notify members:', notifError);
      }

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

      // Get user details for email
      const { data: userData } = await supabase.auth.admin.getUserById(request.user_id);
      const userName = userData.user?.user_metadata?.full_name || 
                      userData.user?.email?.split('@')[0] || 
                      'there';
      const userEmail = userData.user?.email;

      // Send rejection email (non-blocking)
      if (userEmail) {
        try {
          await sendRejectionEmail(
            request.organization.name,
            userName,
            userEmail
          );
        } catch (emailError) {
          console.error('[manage-org-request] Rejection email failed:', emailError);
        }
      }

      // Create in-app notification for the user
      try {
        await createNotification(supabaseAdmin, {
          userId: request.user_id,
          type: 'org_request_rejected',
          title: 'Request Not Approved',
          message: `Your request to join ${request.organization.name} was not approved.`,
          metadata: {
            organizationId: request.organization_id,
            organizationName: request.organization.name,
          },
        });
      } catch (notifError) {
        console.error('[manage-org-request] Failed to create notification:', notifError);
      }

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
