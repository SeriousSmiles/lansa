import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildNudge, STEP_DELAYS_HOURS, STEP_TEMPLATE_KEY } from '../_shared/nudgeTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = 'Lansa <noreply@notification.lansa.online>';
const MAX_STEP = 5;
const BATCH_LIMIT = 100;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY missing' }), { status: 500, headers: corsHeaders });
    }

    // Optional admin-triggered forced run: { userIds: [...] }
    let forcedUserIds: string[] | null = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (Array.isArray(body?.userIds)) forcedUserIds = body.userIds;
      } catch (_) { /* ignore */ }
    }

    // Pull candidates: incomplete, not paused, with a sequence step < MAX_STEP
    let q = supabase
      .from('profile_completion_state')
      .select('user_id, score, missing_steps, nudge_sequence_step, nudge_paused, nudge_paused_until, is_complete')
      .eq('is_complete', false)
      .lt('nudge_sequence_step', MAX_STEP)
      .limit(BATCH_LIMIT);

    if (forcedUserIds) q = q.in('user_id', forcedUserIds);

    const { data: rows, error } = await q;
    if (error) throw error;

    const results: any[] = [];

    for (const row of rows || []) {
      // Paused check
      if (row.nudge_paused) {
        if (!row.nudge_paused_until || new Date(row.nudge_paused_until) > new Date()) {
          results.push({ user_id: row.user_id, status: 'paused' });
          continue;
        }
      }

      // Get auth user
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(row.user_id);
      if (!authUser?.email) {
        results.push({ user_id: row.user_id, status: 'no_email' });
        continue;
      }

      const createdAt = new Date(authUser.created_at);
      const nextStep = (row.nudge_sequence_step ?? 0) + 1;
      if (nextStep > MAX_STEP) continue;

      // Time gate (unless forced)
      if (!forcedUserIds) {
        const requiredHours = STEP_DELAYS_HOURS[nextStep];
        const hoursSinceSignup = (Date.now() - createdAt.getTime()) / 3_600_000;
        if (hoursSinceSignup < requiredHours) {
          results.push({ user_id: row.user_id, status: 'too_early', need_hours: requiredHours, have_hours: Math.round(hoursSinceSignup) });
          continue;
        }
      }

      // Dedupe: don't send same step twice
      const { data: existing } = await supabase
        .from('nudge_history')
        .select('id')
        .eq('user_id', row.user_id)
        .eq('step', nextStep)
        .maybeSingle();
      if (existing) {
        // Already sent — just advance pointer to keep things moving
        await supabase.from('profile_completion_state').update({ nudge_sequence_step: nextStep }).eq('user_id', row.user_id);
        results.push({ user_id: row.user_id, status: 'already_sent', step: nextStep });
        continue;
      }

      // Suppression check (best-effort; table may or may not exist depending on email infra)
      try {
        const { data: suppressed } = await supabase
          .from('suppressed_emails')
          .select('email')
          .eq('email', authUser.email)
          .maybeSingle();
        if (suppressed) {
          results.push({ user_id: row.user_id, status: 'suppressed' });
          continue;
        }
      } catch (_) { /* table may not exist */ }

      // Profile name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, name')
        .eq('user_id', row.user_id)
        .maybeSingle();
      const firstName = profile?.first_name || (profile?.name?.split(' ')[0] ?? null);

      const tpl = buildNudge(nextStep, {
        firstName,
        score: row.score ?? 0,
        missingSteps: Array.isArray(row.missing_steps) ? row.missing_steps : [],
      });

      // Send via Resend
      let resendId: string | null = null;
      let sendError: string | null = null;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: FROM, to: [authUser.email], subject: tpl.subject, html: tpl.html }),
        });
        const body = await res.json();
        if (!res.ok) sendError = body?.message || `HTTP ${res.status}`;
        else resendId = body?.id ?? null;
      } catch (e: any) {
        sendError = e.message;
      }

      // Record history
      await supabase.from('nudge_history').insert({
        user_id: row.user_id,
        step: nextStep,
        template_key: STEP_TEMPLATE_KEY[nextStep],
        email: authUser.email,
        resend_message_id: resendId,
        error: sendError,
      });

      // Advance pointer regardless (errors will be visible in history)
      await supabase
        .from('profile_completion_state')
        .update({
          nudge_sequence_step: nextStep,
          last_nudge_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', row.user_id);

      results.push({ user_id: row.user_id, status: sendError ? 'error' : 'sent', step: nextStep, error: sendError });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});