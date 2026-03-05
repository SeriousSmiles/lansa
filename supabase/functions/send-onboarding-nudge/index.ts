import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANSA_TEAL = '#0D9488';
const LANSA_DARK = '#0F172A';

function buildEmail(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Complete your Lansa profile</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:${LANSA_DARK};padding:28px 40px;text-align:left;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Lansa</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${LANSA_DARK};line-height:1.3;">
                Your account is waiting for you ✨
              </h1>
              <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
                You started signing up for Lansa but didn't quite finish — and that means you're missing out on tools that can seriously change how you find your next role.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${LANSA_TEAL};text-transform:uppercase;letter-spacing:0.5px;">What Lansa gives you</p>
                    <table width="100%" cellpadding="0" cellspacing="6">
                      <tr><td style="padding:4px 0;font-size:14px;color:#0F4C45;">🎯 <strong>AI Skill Reframer</strong> — turn what you know into what employers want to hear</td></tr>
                      <tr><td style="padding:4px 0;font-size:14px;color:#0F4C45;">🪞 <strong>AI Power Mirror</strong> — see yourself through a hiring manager's eyes</td></tr>
                      <tr><td style="padding:4px 0;font-size:14px;color:#0F4C45;">📄 <strong>Smart CV Builder</strong> — export a professional CV in minutes</td></tr>
                      <tr><td style="padding:4px 0;font-size:14px;color:#0F4C45;">🏆 <strong>Lansa Certification</strong> — a verified credential employers recognise</td></tr>
                      <tr><td style="padding:4px 0;font-size:14px;color:#0F4C45;">💼 <strong>Job Matching</strong> — get matched with roles that fit your real profile</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
                It takes less than 3 minutes to complete your profile. No CV needed — just tell us where you are and where you want to go.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${LANSA_TEAL};border-radius:8px;">
                    <a href="https://lansa.online/onboarding" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.1px;">
                      Complete my profile →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                You're receiving this because you started creating a Lansa account with this email address.<br />
                If this wasn't you, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: corsHeaders });
    }

    const { userIds }: { userIds: string[] } = await req.json();
    if (!userIds?.length) return new Response(JSON.stringify({ error: 'No userIds provided' }), { status: 400, headers: corsHeaders });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
    const results: { id: string; email: string; status: string }[] = [];

    for (const userId of userIds) {
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!authUser?.email) {
        results.push({ id: userId, email: '', status: 'skipped_no_email' });
        continue;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Lansa <noreply@notification.lansa.online>',
          to: [authUser.email],
          subject: 'You left something behind — your Lansa profile 👋',
          html: buildEmail(authUser.email),
        }),
      });

      const resBody = await res.json();
      results.push({
        id: userId,
        email: authUser.email,
        status: res.ok ? 'sent' : `error: ${resBody.message || 'unknown'}`,
      });
    }

    const sent = results.filter(r => r.status === 'sent').length;
    return new Response(JSON.stringify({ results, sent, total: userIds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
