/**
 * export-resume — Vector export pipeline v2.
 *
 * Flow:
 *   1. Verify caller.
 *   2. Hash `{ design_json, options }` → check `resume_exports` cache.
 *   3. On miss: create a `resume_print_jobs` row with the render payload,
 *      mint a random print token (store SHA-256 in DB), and call the
 *      Puppeteer worker at `RENDER_WORKER_URL` with the app print URL and
 *      shared secret.
 *   4. Worker returns the binary (pdf/docx/png/jpeg/pdf-a).
 *   5. Upload to the `resume-exports` bucket, create a signed URL, cache it.
 *
 * If `RENDER_WORKER_URL` isn't configured, the function still creates the
 * print job and returns a `print_url` so the client can fall back to the
 * legacy in-browser export path without breaking.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExportFormat = 'pdf' | 'pdf-a' | 'docx' | 'png' | 'jpeg';

interface ExportOptions {
  format: ExportFormat;
  paper?: 'A4' | 'Letter';
  dpi?: number;
}

function b64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function mimeFor(f: ExportFormat) {
  switch (f) {
    case 'pdf':
    case 'pdf-a':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'png':
      return 'image/png';
    case 'jpeg':
      return 'image/jpeg';
  }
}

function extFor(f: ExportFormat) {
  if (f === 'pdf-a') return 'pdf';
  if (f === 'jpeg') return 'jpg';
  return f;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return json({ error: 'Unauthorized' }, 401);
    const user = userRes.user;

    const body = await req.json() as {
      design_id?: string;
      design_json: unknown;
      tokens?: unknown;
      data?: unknown;
      options: ExportOptions;
      app_origin?: string;
    };

    const options = body.options ?? { format: 'pdf' };
    const format: ExportFormat = options.format ?? 'pdf';

    // ---- cache lookup ---------------------------------------------------
    const fileHash = await sha256(JSON.stringify({
      design_id: body.design_id ?? null,
      design_json: body.design_json ?? null,
      tokens: body.tokens ?? null,
      data: body.data ?? null,
      options,
    }));

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    {
      const { data: cached } = await admin
        .from('resume_exports')
        .select('id, file_url, expires_at')
        .eq('user_id', user.id)
        .eq('file_hash', fileHash)
        .maybeSingle();
      if (cached && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
        return json({ success: true, file_url: cached.file_url, export_id: cached.id, cached: true });
      }
    }

    // ---- mint print token + store payload -------------------------------
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = b64url(tokenBytes);
    const tokenHash = await sha256(token);

    const payload = {
      data: body.data,
      tokens: body.tokens,
      design_id: body.design_id,
      design_json: body.design_json,
    };

    const { data: job, error: jobErr } = await admin
      .from('resume_print_jobs')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        payload,
        format,
      })
      .select('id')
      .single();
    if (jobErr) throw jobErr;

    const appOrigin = body.app_origin
      ?? req.headers.get('origin')
      ?? 'https://lansa.online';
    const printUrl = `${appOrigin}/resume/print/${token}`;

    const workerUrl = Deno.env.get('RENDER_WORKER_URL');
    if (!workerUrl) {
      // Worker not deployed yet — return print URL so client can fall back.
      return json({
        success: false,
        error: 'RENDER_WORKER_URL not configured',
        fallback: 'client_render',
        print_url: printUrl,
        job_id: job.id,
      }, 202);
    }

    // ---- call the render worker -----------------------------------------
    const workerRes = await fetch(`${workerUrl.replace(/\/$/, '')}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Render-Secret': Deno.env.get('RENDER_SHARED_SECRET') ?? '',
      },
      body: JSON.stringify({
        url: printUrl,
        format,
        paper: options.paper ?? 'A4',
        payload, // worker uses this directly for DOCX; PDF/PNG/JPEG use `url`
      }),
    });
    if (!workerRes.ok) {
      const t = await workerRes.text();
      console.error('worker render failed', workerRes.status, t);
      return json({ error: 'Worker render failed', status: workerRes.status, details: t }, 502);
    }

    const bin = new Uint8Array(await workerRes.arrayBuffer());

    // ---- upload + sign URL ---------------------------------------------
    const path = `${user.id}/${fileHash}.${extFor(format)}`;
    const { error: upErr } = await admin.storage
      .from('resume-exports')
      .upload(path, bin, { contentType: mimeFor(format), upsert: true });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await admin.storage
      .from('resume-exports')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    if (signErr) throw signErr;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: exportRow, error: exportErr } = await admin
      .from('resume_exports')
      .insert({
        user_id: user.id,
        design_id: body.design_id ?? null,
        format,
        file_url: signed.signedUrl,
        file_hash: fileHash,
        options,
        expires_at: expiresAt,
      })
      .select('id')
      .single();
    if (exportErr) console.warn('cache insert failed', exportErr);

    return json({
      success: true,
      file_url: signed.signedUrl,
      export_id: exportRow?.id ?? null,
      bytes: bin.byteLength,
    });
  } catch (e) {
    console.error('export-resume error', e);
    return json({ error: (e as Error).message }, 500);
  }

  function json(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
