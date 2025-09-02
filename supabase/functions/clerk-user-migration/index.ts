import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userId, clerkUserId, email, organizationId } = await req.json()

    console.log('Migration action:', action, { userId, clerkUserId, email, organizationId });

    switch (action) {
      case 'initiate_migration':
        return await initiateMigration(supabaseClient, userId, email);
      
      case 'complete_migration':
        return await completeMigration(supabaseClient, userId, clerkUserId);
      
      case 'sync_organization':
        return await syncOrganization(supabaseClient, clerkUserId, organizationId);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function initiateMigration(supabaseClient: any, userId: string, email: string) {
  // Create migration mapping entry
  const { data, error } = await supabaseClient
    .from('user_migration_mapping')
    .upsert({
      supabase_user_id: userId,
      migration_status: 'invited',
      invited_at: new Date().toISOString(),
      metadata: { email }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create migration mapping: ${error.message}`);
  }

  // Here you would typically send an invitation email
  // For now, we'll just log the invitation
  console.log(`Migration initiated for user ${userId} (${email})`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Migration initiated successfully',
      migrationId: data.id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function completeMigration(supabaseClient: any, supabaseUserId: string, clerkUserId: string) {
  // Update migration mapping
  const { error: mappingError } = await supabaseClient
    .from('user_migration_mapping')
    .update({
      clerk_user_id: clerkUserId,
      migration_status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('supabase_user_id', supabaseUserId);

  if (mappingError) {
    throw new Error(`Failed to update migration mapping: ${mappingError.message}`);
  }

  // Update user profile with Clerk user ID
  const { error: profileError } = await supabaseClient
    .from('user_profiles')
    .update({
      clerk_user_id: clerkUserId,
      migration_status: 'migrated'
    })
    .eq('user_id', supabaseUserId);

  if (profileError) {
    console.warn('Failed to update user profile:', profileError.message);
  }

  console.log(`Migration completed for user ${supabaseUserId} -> ${clerkUserId}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Migration completed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncOrganization(supabaseClient: any, clerkUserId: string, organizationData: any) {
  const { id: clerkOrgId, name, slug, metadata } = organizationData;

  // Create or update organization
  const { data: orgData, error: orgError } = await supabaseClient
    .from('organizations')
    .upsert({
      clerk_org_id: clerkOrgId,
      name,
      slug,
      settings: metadata || {}
    })
    .select()
    .single();

  if (orgError) {
    throw new Error(`Failed to sync organization: ${orgError.message}`);
  }

  console.log(`Organization synced: ${name} (${clerkOrgId})`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Organization synced successfully',
      organizationId: orgData.id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}