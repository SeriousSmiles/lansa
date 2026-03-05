import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_DAYS = 5;
const CHUNK_SIZE = 100;
const DASHBOARD_URL = 'https://lansa.online/dashboard';

const LANSA_LOGO_B64 = 'PHN2ZyB3aWR0aD0iMTk1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE5NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOTIuMjQgNzkuNDI5N0MxOTMuMzE1IDc5LjM3OCAxOTQuMjI1IDgwLjE3ODYgMTk0LjI5OSA4MS4yNDAyQzE5OC4yODEgMTM4LjI1NiAxNjIuNDQ0IDIwMC45OTggMTE1LjY0IDI1Mi43NDVDMTE0LjkzNCAyNTMuNTI1IDExMy42MzMgMjUyLjgyIDExMy44ODkgMjUxLjgwNUMxMTcuOTYgMjM1LjY1MiAxMTguNjA0IDIyMS4yODggMTE1LjgyMSAyMDguNzFDOTMuNTU4MyAyNDQuNjI5IDQxLjQ2MjQgMjcyLjE4NCAzLjE3OTY5IDI3Ny45NjRDMC4zODIgMjc4LjM4NiAtMS4wOTQ4NyAyNzUuMDgxIDAuOTYwOTM4IDI3My4xNTdDNTMuNjI4OCAyMjMuODgzIDcyLjMzNjIgMjAyLjE3NCA5MC4yMTM5IDE3NC4xNDNDNjMuOTk2NyAxODguMDA1IDQyLjMzNDIgMTk3Ljc4OCAyMi4wOTY3IDIwMS4yMThDMTkuOTIxNSAyMDEuNTg2IDE4LjIxMzkgMTk5LjQ4MiAxOC45NDYzIDE5Ny40MjRDNTEuNzQ5MSAxMDUuMjUyIDEzMC43MiA4Mi4zODkyIDE5Mi4yNCA3OS40Mjk3Wk0xMTUuMTcxIDBDMTM0LjkxMSAwIDE1MC45MTQgMTYuODkxNiAxNTAuOTE0IDM3LjcyODVDMTUwLjkxNCA1OC41NjU2IDEzNC45MTEgNzUuNDU4IDExNS4xNzEgNzUuNDU4Qzk1LjQzMDYgNzUuNDU3OSA3OS40Mjc3IDU4LjU2NTUgNzkuNDI3NyAzNy43Mjg1Qzc5LjQyNzkgMTYuODkxNyA5NS40MzA3IDAuMDAwMTA4OTUgMTE1LjE3MSAwWiIgZmlsbD0iIzFBMUY3MSIvPgo8L3N2Zz4=';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const token = authHeader.replace('Bearer ', '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userId = claimsData.claims.sub;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return jsonResponse({ error: 'Admin access required' }, 403);
    }

    const resend = new Resend(resendApiKey);

    // 1. Fetch all users with emails
    const { data: users, error: usersError } = await serviceClient
      .from('user_profiles')
      .select('user_id, name, email, color_auto, certified, visible_to_employers')
      .not('email', 'is', null)
      .neq('email', '');

    if (usersError) throw usersError;
    if (!users?.length) return jsonResponse({ sent: 0, skipped_rate_limited: 0, skipped_no_email: 0 });

    console.log(`[broadcast-segment-emails] Processing ${users.length} users`);

    const userIds = users.map(u => u.user_id);

    // 2. Bulk fetch user_type from user_answers (source of truth)
    const [answersResult, actionsResult, recentLogsResult] = await Promise.all([
      serviceClient
        .from('user_answers')
        .select('user_id, user_type')
        .in('user_id', userIds),
      serviceClient
        .from('user_actions')
        .select('user_id, action_type')
        .in('user_id', userIds)
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()),
      serviceClient
        .from('segment_email_log')
        .select('user_id, new_segment, email_sent_at')
        .in('user_id', userIds)
        .gte('email_sent_at', new Date(Date.now() - RATE_LIMIT_DAYS * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Build user_type map from user_answers
    const userTypeMap: Record<string, 'job_seeker' | 'employer'> = {};
    answersResult.data?.forEach(a => {
      if (a.user_type) userTypeMap[a.user_id] = a.user_type as 'job_seeker' | 'employer';
    });

    // Build actions map
    const actionsMap: Record<string, Record<string, number>> = {};
    actionsResult.data?.forEach(a => {
      if (!actionsMap[a.user_id]) actionsMap[a.user_id] = {};
      actionsMap[a.user_id][a.action_type] = (actionsMap[a.user_id][a.action_type] || 0) + 1;
    });

    // Build rate-limit set: ANY email to this user within the window blocks ALL segments.
    // This prevents the race condition where transition emails (send-segment-email) and
    // manual broadcasts (this function) both fire within the same rate-limit window.
    const recentlyEmailedUserIds = new Set<string>();
    recentLogsResult.data?.forEach(l => recentlyEmailedUserIds.add(l.user_id));

    let sent = 0;
    let skipped_rate_limited = 0;
    let skipped_no_email = 0;

    const emailPayloads: { from: string; to: string[]; subject: string; html: string }[] = [];
    const logRows: { user_id: string; old_segment: string; new_segment: string; email_sent_at: string }[] = [];

    // 3. Build payloads for all eligible users
    for (const user of users) {
      if (!user.email) { skipped_no_email++; continue; }

      const segment = user.color_auto || 'red';

      // Unified rate-limit: block if ANY segment email was sent to this user within RATE_LIMIT_DAYS,
      // regardless of which system sent it (transition trigger or manual broadcast).
      const isRateLimited = recentlyEmailedUserIds.has(user.user_id);

      if (isRateLimited) { skipped_rate_limited++; continue; }

      // Determine user type from user_answers (not user_roles)
      const userType = userTypeMap[user.user_id] || 'job_seeker';
      const isEmployer = userType === 'employer';
      const actionCounts = actionsMap[user.user_id] || {};

      const emailContent = isEmployer
        ? buildEmployerEmail({ name: user.name || 'there', segment, actionCounts })
        : buildSeekerEmail({
            name: user.name || 'there',
            segment,
            actionCounts,
            certified: !!user.certified,
            visibleToEmployers: !!user.visible_to_employers,
          });

      emailPayloads.push({
        from: 'Lansa <noreply@notification.lansa.online>',
        to: [user.email],
        subject: emailContent.subject,
        html: emailContent.html,
      });

      logRows.push({
        user_id: user.user_id,
        old_segment: segment,
        new_segment: segment,
        email_sent_at: new Date().toISOString(),
      });
    }

    // 4. Send in chunks of 100 using Resend batch API
    for (let i = 0; i < emailPayloads.length; i += CHUNK_SIZE) {
      const chunk = emailPayloads.slice(i, i + CHUNK_SIZE);
      try {
        await resend.batch.send(chunk);
        sent += chunk.length;
      } catch (e) {
        console.error(`[broadcast] Batch chunk ${i}–${i + CHUNK_SIZE} failed:`, e);
        skipped_no_email += chunk.length;
        // Remove corresponding log rows for failed chunk
        logRows.splice(i, chunk.length);
      }
    }

    // 5. Single bulk log insert
    if (logRows.length > 0) {
      await serviceClient.from('segment_email_log').insert(logRows);
    }

    console.log(`[broadcast-segment-emails] Done. Sent: ${sent}, Rate-limited: ${skipped_rate_limited}, No email: ${skipped_no_email}`);
    return jsonResponse({ sent, skipped_rate_limited, skipped_no_email });

  } catch (error: any) {
    console.error('[broadcast-segment-emails] Error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── HTML wrapper ────────────────────────────────────────────────────────────

function wrapHtml(subject: string, headerAccent: string, accentBadge: string, headline: string, bodyText: string, ctaText: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:${headerAccent};padding:32px 40px;text-align:center;">
            <img src="data:image/svg+xml;base64,${LANSA_LOGO_B64}" alt="Lansa" width="28" height="40" style="display:inline-block;filter:brightness(0) invert(1);" />
            ${accentBadge ? `<p style="color:#ffffff;opacity:0.9;font-size:12px;letter-spacing:1px;margin:10px 0 0;">${accentBadge}</p>` : ''}
            <p style="color:#ffffff;opacity:0.6;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 0;">Career Intelligence</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 14px;line-height:1.35;">${headline}</h1>
            <p style="color:#374151;font-size:15px;line-height:1.65;margin:0 0 28px;">${bodyText}</p>
            <a href="${DASHBOARD_URL}" style="display:inline-block;background:${headerAccent};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;">${ctaText} →</a>
          </td>
        </tr>
        <tr><td style="padding:0 40px;"><hr style="border:0;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">Lansa — Career Intelligence Platform</p>
            <p style="color:#9ca3af;font-size:11px;margin:0;">You're receiving this because you have a Lansa account.<br>
            <a href="${DASHBOARD_URL}" style="color:#6b7280;">Manage preferences</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Job Seeker email builder ─────────────────────────────────────────────────

interface SeekerEmailParams {
  name: string;
  segment: string;
  actionCounts: Record<string, number>;
  certified: boolean;
  visibleToEmployers: boolean;
}

function buildSeekerEmail(p: SeekerEmailParams): { subject: string; html: string } {
  // Determine which seeker features haven't been used yet
  const unusedFeatures: string[] = [];
  if (!p.actionCounts['power_skill_reframed']) unusedFeatures.push('AI Skill Reframer');
  if (!p.actionCounts['ai_mirror_used']) unusedFeatures.push('AI Power Mirror');
  if (!p.actionCounts['resume_exported']) unusedFeatures.push('CV Builder');
  if (!p.actionCounts['job_applied']) unusedFeatures.push('Job Discovery');
  if (!p.actionCounts['goal_90day_created']) unusedFeatures.push('90-Day Goal Planner');
  if (!p.actionCounts['growth_prompt_completed']) unusedFeatures.push('Growth Challenges');
  const nextFeature = unusedFeatures[0] || null;

  let subject = '';
  let headline = '';
  let bodyText = '';
  let ctaText = 'Open Lansa';
  let headerAccent = '#1A1F71';
  let accentBadge = '';

  if (p.segment === 'purple') {
    headerAccent = '#6d28d9';
    accentBadge = '⭐ Advocate';
    subject = `You're a Lansa Advocate, ${p.name} — thank you`;
    headline = `You're at the top, ${p.name}. We see you.`;
    const achievements: string[] = [];
    if (p.certified) achievements.push('Lansa Certified');
    if (p.actionCounts['job_applied']) achievements.push(`${p.actionCounts['job_applied']} job application${p.actionCounts['job_applied'] > 1 ? 's' : ''} submitted`);
    if (p.actionCounts['ai_mirror_used']) achievements.push('AI Power Mirror used');
    if (p.actionCounts['resume_exported']) achievements.push('CV exported');
    if (p.actionCounts['power_skill_reframed']) achievements.push('Skills reframed with AI');
    const achievementText = achievements.length > 0
      ? `You've accomplished so much on your career journey: ${achievements.join(', ')}. That's real momentum.`
      : `You've been one of our most consistent users — and it shows in your profile.`;
    bodyText = `${achievementText} Thank you for trusting Lansa as part of your career story. Share it with someone who needs it — you could change their trajectory too.`;
    ctaText = 'See Your Impact';

  } else if (p.segment === 'green') {
    headerAccent = '#059669';
    accentBadge = '🔥 Engaged';
    subject = `You're building real momentum, ${p.name} — keep it up`;
    headline = `You're on fire, ${p.name}. Keep going.`;
    bodyText = nextFeature
      ? `You've been consistently using Lansa — that puts you ahead of most candidates. Your next move to level up further: try the **${nextFeature}**. It could be the edge that gets you noticed by the right employer.`
      : `You're using Lansa consistently — your AI Mirror, CV Builder, and job applications are all working together. Employers are actively searching. Stay visible and keep applying.`;
    ctaText = nextFeature ? `Try ${nextFeature}` : 'Keep Going';

  } else if (p.segment === 'orange') {
    headerAccent = '#d97706';
    accentBadge = '⚡ Building';
    subject = `Your next power move on Lansa, ${p.name}`;
    headline = `You're building momentum, ${p.name}.`;
    const doneCount = Object.values(p.actionCounts).reduce((a, b) => a + b, 0);
    bodyText = nextFeature
      ? `You've taken ${doneCount} action${doneCount !== 1 ? 's' : ''} — that's a great start. Your next move: try the **${nextFeature}**. It's one of the most powerful tools for getting noticed. Takes 5 minutes.`
      : `You're making real progress on Lansa. Keep building your profile with the AI Skill Reframer, CV Builder, and Job Discovery to stay ahead of the competition.`;
    ctaText = nextFeature ? `Try ${nextFeature}` : 'Keep Going';

  } else {
    // Red
    headerAccent = '#dc2626';
    accentBadge = '👋 Come Back';
    subject = `Don't let your progress fade, ${p.name}`;
    headline = `Your career momentum is waiting, ${p.name}.`;
    bodyText = nextFeature
      ? `You haven't tried the **${nextFeature}** yet — it's one of the most powerful tools for getting visible to employers. The AI Skill Reframer, Power Mirror, CV Builder, and Job Discovery are all ready for you. Take 5 minutes today.`
      : `Your Lansa profile is set up and ready. Employers are actively looking for candidates — use the AI tools to reframe your skills, polish your CV, and get discovered.`;
    ctaText = nextFeature ? `Try ${nextFeature}` : 'Come Back';
  }

  return { subject, html: wrapHtml(subject, headerAccent, accentBadge, headline, bodyText, ctaText) };
}

// ─── Employer email builder ───────────────────────────────────────────────────

interface EmployerEmailParams {
  name: string;
  segment: string;
  actionCounts: Record<string, number>;
}

function buildEmployerEmail(p: EmployerEmailParams): { subject: string; html: string } {
  const unusedFeatures: string[] = [];
  if (!p.actionCounts['job_posted']) unusedFeatures.push('Post a Job');
  if (!p.actionCounts['application_reviewed']) unusedFeatures.push('Browse Candidates');
  if (!p.actionCounts['candidate_accepted']) unusedFeatures.push('Shortlist a Candidate');
  const nextFeature = unusedFeatures[0] || null;

  let subject = '';
  let headline = '';
  let bodyText = '';
  let ctaText = 'Open Lansa';
  let headerAccent = '#1A1F71';
  let accentBadge = '';

  if (p.segment === 'purple') {
    headerAccent = '#6d28d9';
    accentBadge = '⭐ Hiring Advocate';
    subject = `You're a top hiring advocate on Lansa, ${p.name}`;
    headline = `You're one of our most active employers, ${p.name}.`;
    const achievements: string[] = [];
    if (p.actionCounts['job_posted']) achievements.push(`${p.actionCounts['job_posted']} job${p.actionCounts['job_posted'] > 1 ? 's' : ''} posted`);
    if (p.actionCounts['application_reviewed']) achievements.push(`${p.actionCounts['application_reviewed']} application${p.actionCounts['application_reviewed'] > 1 ? 's' : ''} reviewed`);
    if (p.actionCounts['candidate_accepted']) achievements.push(`${p.actionCounts['candidate_accepted']} candidate${p.actionCounts['candidate_accepted'] > 1 ? 's' : ''} accepted`);
    const achievementText = achievements.length > 0
      ? `Your hiring activity stands out: ${achievements.join(', ')}. That's what building a great team looks like.`
      : `You've been consistently active on Lansa — and the candidates notice.`;
    bodyText = `${achievementText} Thank you for using Lansa to find talent. Keep reviewing your pipeline to find your next great hire.`;
    ctaText = 'Review Pipeline';

  } else if (p.segment === 'green') {
    headerAccent = '#059669';
    accentBadge = '🔥 Actively Hiring';
    subject = `Your hiring pipeline is active, ${p.name} — keep reviewing`;
    headline = `You're actively hiring on Lansa, ${p.name}.`;
    bodyText = nextFeature
      ? `You're making great hiring progress. Your next step: **${nextFeature}** — it helps you move candidates through your pipeline faster and find the right fit sooner.`
      : `Your pipeline is strong — keep reviewing applications and shortlisting candidates. The right hire is likely already in your queue.`;
    ctaText = 'Review Candidates';

  } else if (p.segment === 'orange') {
    headerAccent = '#d97706';
    accentBadge = '⚡ Getting Started';
    subject = `Your hiring pipeline is ready, ${p.name} — next step inside`;
    headline = `You've started hiring on Lansa, ${p.name}.`;
    bodyText = nextFeature
      ? `You've taken your first hiring steps — great start. Your next move: **${nextFeature}**. Qualified candidates are already on Lansa looking for opportunities like yours.`
      : `You're building your hiring pipeline on Lansa. Keep reviewing applications and browsing candidates to find your next team member.`;
    ctaText = nextFeature ? nextFeature : 'View Pipeline';

  } else {
    // Red
    headerAccent = '#dc2626';
    accentBadge = '👋 Come Back';
    subject = `Your hiring pipeline needs attention, ${p.name}`;
    headline = `Your next hire is waiting, ${p.name}.`;
    bodyText = nextFeature
      ? `You haven't **${nextFeature === 'Post a Job' ? 'posted a job yet' : nextFeature === 'Browse Candidates' ? 'browsed candidates yet' : 'shortlisted a candidate yet'}**. Qualified candidates are actively looking on Lansa right now — post a role or browse the talent pool to get started.`
      : `It's been a while since you've been active. Your hiring pipeline on Lansa is ready — come back, review your open applications, and find your next hire.`;
    ctaText = 'View Pipeline';
  }

  return { subject, html: wrapHtml(subject, headerAccent, accentBadge, headline, bodyText, ctaText) };
}
