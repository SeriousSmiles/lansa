/**
 * resume-print-fetch — invoked by the /resume/print/:token page in the app.
 *
 * Accepts a token, verifies it against `resume_print_jobs.token_hash`, and
 * returns the stored payload (design data + tokens). Rows expire after 10
 * minutes and are marked consumed on first successful fetch so a leaked
 * token has a small blast radius.
 *
 * verify_jwt is false (managed by Lovable) — the token itself is the auth.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return json({ error: 'Missing token' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const tokenHash = await sha256(token);
    const { data: job, error } = await supabase
      .from('resume_print_jobs')
      .select('id, user_id, payload, expires_at, consumed_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error) throw error;
    if (!job) return json({ error: 'Invalid token' }, 404);
    if (new Date(job.expires_at) < new Date()) return json({ error: 'Token expired' }, 410);

    // Mark consumed (idempotent — worker may reload the page)
    if (!job.consumed_at) {
      await supabase
        .from('resume_print_jobs')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', job.id);
    }

    return json(job.payload, 200);
  } catch (e) {
    console.error('resume-print-fetch error', e);
    return json({ error: (e as Error).message }, 500);
  }

  function json(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});