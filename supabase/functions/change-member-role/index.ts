/**
 * Phase 3: Change Member Role Edge Function
 * Allows organization admins/owners to change member roles with proper validation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getAuthenticatedUser, formatAuthError } from '../_shared/guard.ts';
import { requireOrgRole, type OrgRole } from '../_shared/orgPermissions.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeRoleRequest {
  membershipId: string;
  newRole: OrgRole;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const state = await getAuthenticatedUser(supabase);
    const { membershipId, newRole }: ChangeRoleRequest = await req.json();

    console.log(`[change-member-role] User ${state.userId} changing role for ${membershipId} to ${newRole}`);

    // Get the target membership
    const { data: targetMembership, error: fetchError } = await supabase
      .from('organization_memberships')
      .select('*, organization:organizations(name)')
      .eq('id', membershipId)
      .single();

    if (fetchError || !targetMembership) {
      return new Response(
        JSON.stringify({ error: 'Membership not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgId = targetMembership.organization_id;

    // Check actor's permissions
    const actorMembership = await requireOrgRole(supabase, state.userId, orgId, ['owner', 'admin']);

    // Validation rules
    // 1. Only owners can assign owner role
    if (newRole === 'owner' && actorMembership.role !== 'owner') {
      return new Response(
        JSON.stringify({ error: 'Only owners can assign the owner role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Admins cannot change owner roles
    if (targetMembership.role === 'owner' && actorMembership.role !== 'owner') {
      return new Response(
        JSON.stringify({ error: 'Only owners can change other owners\' roles' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Cannot demote the last owner
    if (targetMembership.role === 'owner' && newRole !== 'owner') {
      const { data: ownerCount } = await supabase
        .from('organization_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('role', 'owner')
        .eq('is_active', true);

      if ((ownerCount as any) <= 1) {
        return new Response(
          JSON.stringify({ error: 'Cannot demote the last owner. Promote another member to owner first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update the role
    const { error: updateError } = await supabaseAdmin
      .from('organization_memberships')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membershipId);

    if (updateError) {
      console.error('[change-member-role] Error updating role:', updateError);
      throw updateError;
    }

    // Log the action
    await supabaseAdmin
      .from('organization_audit_log')
      .insert({
        organization_id: orgId,
        user_id: targetMembership.user_id,
        action: 'role_changed',
        performed_by: state.userId,
        metadata: {
          old_role: targetMembership.role,
          new_role: newRole,
          membership_id: membershipId,
        },
      });

    console.log(`[change-member-role] Successfully changed role to ${newRole}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Role updated successfully',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[change-member-role] Error:', error);
    return formatAuthError(error);
  }
});
