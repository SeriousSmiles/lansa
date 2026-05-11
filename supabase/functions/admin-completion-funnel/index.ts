import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { data: roleData } = await supabaseAdmin
      .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: corsHeaders });

    // Pull state
    const { data: state } = await supabaseAdmin
      .from('profile_completion_state')
      .select('user_id, score, is_complete, missing_steps, nudge_sequence_step, last_nudge_sent_at, nudge_paused, nudge_paused_until, last_score_at, user_type')
      .order('score', { ascending: true });

    // Auth users
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authById = new Map(authUsers.map(u => [u.id, u]));

    const rows = (state || []).map(s => {
      const au = authById.get(s.user_id);
      return {
        user_id: s.user_id,
        email: au?.email ?? null,
        signed_up_at: au?.created_at ?? null,
        last_sign_in_at: au?.last_sign_in_at ?? null,
        score: s.score,
        is_complete: s.is_complete,
        missing_count: Array.isArray(s.missing_steps) ? s.missing_steps.length : 0,
        nudge_sequence_step: s.nudge_sequence_step,
        last_nudge_sent_at: s.last_nudge_sent_at,
        nudge_paused: s.nudge_paused,
        user_type: s.user_type,
      };
    });

    // Funnel buckets
    const total = rows.length;
    const complete = rows.filter(r => r.is_complete).length;
    const b_0_25 = rows.filter(r => !r.is_complete && r.score <= 25).length;
    const b_26_50 = rows.filter(r => !r.is_complete && r.score > 25 && r.score <= 50).length;
    const b_51_84 = rows.filter(r => !r.is_complete && r.score > 50 && r.score < 85).length;

    return new Response(JSON.stringify({
      funnel: { total, complete, b_0_25, b_26_50, b_51_84 },
      rows,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});