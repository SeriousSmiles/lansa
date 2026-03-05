import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_DAYS = 5;
const DASHBOARD_URL = 'https://lansa.online/dashboard';

const LANSA_LOGO_B64 = 'PHN2ZyB3aWR0aD0iMTk1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE5NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOTIuMjQgNzkuNDI5N0MxOTMuMzE1IDc5LjM3OCAxOTQuMjI1IDgwLjE3ODYgMTk0LjI5OSA4MS4yNDAyQzE5OC4yODEgMTM4LjI1NiAxNjIuNDQ0IDIwMC45OTggMTE1LjY0IDI1Mi43NDVDMTE0LjkzNCAyNTMuNTI1IDExMy42MzMgMjUyLjgyIDExMy44ODkgMjUxLjgwNUMxMTcuOTYgMjM1LjY1MiAxMTguNjA0IDIyMS4yODggMTE1LjgyMSAyMDguNzFDOTMuNTU4MyAyNDQuNjI5IDQxLjQ2MjQgMjcyLjE4NCAzLjE3OTY5IDI3Ny45NjRDMC4zODIgMjc4LjM4NiAtMS4wOTQ4NyAyNzUuMDgxIDAuOTYwOTM4IDI3My4xNTdDNTMuNjI4OCAyMjMuODgzIDcyLjMzNjIgMjAyLjE3NCA5MC4yMTM5IDE3NC4xNDNDNjMuOTk2NyAxODguMDA1IDQyLjMzNDIgMTk3Ljc4OCAyMi4wOTY3IDIwMS4yMThDMTkuOTIxNSAyMDEuNTg2IDE4LjIxMzkgMTk5LjQ4MiAxOC45NDYzIDE5Ny40MjRDNTEuNzQ5MSAxMDUuMjUyIDEzMC43MiA4Mi4zODkyIDE5Mi4yNCA3OS40Mjk3Wk0xMTUuMTcxIDBDMTM0LjkxMSAwIDE1MC45MTQgMTYuODkxNiAxNTAuOTE0IDM3LjcyODVDMTUwLjkxNCA1OC41NjU2IDEzNC45MTEgNzUuNDU4IDExNS4xNzEgNzUuNDU4Qzk1LjQzMDYgNzUuNDU3OSA3OS40Mjc3IDU4LjU2NTUgNzkuNDI3NyAzNy43Mjg1Qzc5LjQyNzkgMTYuODkxNyA5NS40MzA3IDAuMDAwMTA4OTUgMTE1LjE3MSAwWiIgZmlsbD0iIzFBMUY3MSIvPgo8L3N2Zz4=';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    // Verify admin role using user's token
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

    // Fetch all users with emails
    const { data: users, error: usersError } = await serviceClient
      .from('user_profiles')
      .select('user_id, name, email, color_auto, certified, visible_to_employers')
      .not('email', 'is', null)
      .neq('email', '');

    if (usersError) throw usersError;
    if (!users?.length) return jsonResponse({ sent: 0, skipped_rate_limited: 0, skipped_no_email: 0 });

    console.log(`[broadcast-segment-emails] Processing ${users.length} users`);

    // Fetch all roles in bulk
    const userIds = users.map(u => u.user_id);
    const { data: allRoles } = await serviceClient
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const rolesMap: Record<string, string[]> = {};
    allRoles?.forEach(r => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });

    // Fetch all actions in bulk (last 60 days)
    const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: allActions } = await serviceClient
      .from('user_actions')
      .select('user_id, action_type')
      .in('user_id', userIds)
      .gte('created_at', since60);

    const actionsMap: Record<string, Record<string, number>> = {};
    allActions?.forEach(a => {
      if (!actionsMap[a.user_id]) actionsMap[a.user_id] = {};
      actionsMap[a.user_id][a.action_type] = (actionsMap[a.user_id][a.action_type] || 0) + 1;
    });

    // Fetch recent email log (rate-limiting)
    const since5d = new Date(Date.now() - RATE_LIMIT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await serviceClient
      .from('segment_email_log')
      .select('user_id, new_segment, email_sent_at')
      .in('user_id', userIds)
      .gte('email_sent_at', since5d);

    // Build a set: userId+segment recently emailed
    const recentEmailKeys = new Set<string>();
    recentLogs?.forEach(l => recentEmailKeys.add(`${l.user_id}:${l.new_segment}`));

    let sent = 0;
    let skipped_rate_limited = 0;
    let skipped_no_email = 0;

    for (const user of users) {
      if (!user.email) { skipped_no_email++; continue; }

      const segment = user.color_auto || 'red';

      // Purple users: separate rate-limit key (only skip if purple email sent in last 5d)
      // Other segments: skip if any segment email in last 5d
      let isRateLimited = false;
      if (segment === 'purple') {
        isRateLimited = recentEmailKeys.has(`${user.user_id}:purple`);
      } else {
        // Check if any recent email exists for this user
        isRateLimited = recentLogs?.some(l => l.user_id === user.user_id) ?? false;
      }

      if (isRateLimited) { skipped_rate_limited++; continue; }

      const userRoles = rolesMap[user.user_id] || [];
      const isEmployer = userRoles.some(r => ['employer', 'business'].includes(r));
      const actionCounts = actionsMap[user.user_id] || {};

      const emailContent = buildEmailContent({
        name: user.name || 'there',
        segment,
        isEmployer,
        actionCounts,
        certified: !!user.certified,
        visibleToEmployers: !!user.visible_to_employers,
      });

      try {
        const { error: sendError } = await resend.emails.send({
          from: 'Lansa <noreply@notification.lansa.online>',
          to: [user.email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        if (sendError) {
          console.error(`[broadcast] Failed for ${user.email}:`, sendError);
          skipped_no_email++;
          continue;
        }

        // Log to segment_email_log
        await serviceClient.from('segment_email_log').insert({
          user_id: user.user_id,
          old_segment: segment as any,
          new_segment: segment as any,
          email_sent_at: new Date().toISOString(),
        });

        sent++;
      } catch (e) {
        console.error(`[broadcast] Exception for ${user.email}:`, e);
        skipped_no_email++;
      }
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

interface EmailParams {
  name: string;
  segment: string;
  isEmployer: boolean;
  actionCounts: Record<string, number>;
  certified: boolean;
  visibleToEmployers: boolean;
}

function buildEmailContent(p: EmailParams): { subject: string; html: string } {
  let subject = '';
  let headline = '';
  let bodyText = '';
  let ctaText = 'Open Lansa';
  let headerAccent = '#1A1F71';
  let accentBadge = '';

  const unusedSeekerFeatures: string[] = [];
  if (!p.isEmployer) {
    if (!p.actionCounts['power_skill_reframed']) unusedSeekerFeatures.push('AI Skill Reframer');
    if (!p.actionCounts['goal_90day_created']) unusedSeekerFeatures.push('90-Day Goal Planner');
    if (!p.actionCounts['ai_mirror_used']) unusedSeekerFeatures.push('AI Power Mirror');
    if (!p.actionCounts['resume_exported']) unusedSeekerFeatures.push('CV Builder');
    if (!p.actionCounts['job_applied']) unusedSeekerFeatures.push('Job Discovery');
    if (!p.actionCounts['growth_prompt_completed']) unusedSeekerFeatures.push('Growth Challenges');
  }

  const unusedEmployerFeatures: string[] = [];
  if (p.isEmployer) {
    if (!p.actionCounts['job_posted']) unusedEmployerFeatures.push('Post a Job');
    if (!p.actionCounts['application_reviewed']) unusedEmployerFeatures.push('Review Applications');
    if (!p.actionCounts['candidate_accepted']) unusedEmployerFeatures.push('Accept Candidates');
  }

  const unusedFeatures = p.isEmployer ? unusedEmployerFeatures : unusedSeekerFeatures;
  const nextFeature = unusedFeatures[0] || null;

  if (p.segment === 'purple') {
    // ★ ADVOCATE EMAIL
    headerAccent = '#6d28d9';
    accentBadge = '⭐ Advocate';
    subject = `You're a Lansa Advocate, ${p.name} — thank you`;
    headline = `You're at the top, ${p.name}. We see you.`;
    const achievements: string[] = [];
    if (p.certified) achievements.push('Lansa Certified');
    if (p.actionCounts['job_applied']) achievements.push(`${p.actionCounts['job_applied']} job application${p.actionCounts['job_applied'] > 1 ? 's' : ''}`);
    if (p.actionCounts['ai_mirror_used']) achievements.push('AI Power Mirror used');
    if (p.actionCounts['resume_exported']) achievements.push('CV exported');
    if (p.actionCounts['power_skill_reframed']) achievements.push('Skills reframed with AI');
    const achievementText = achievements.length > 0
      ? `You've accomplished so much: ${achievements.join(', ')}. That's real momentum.`
      : `You've been one of our most consistent users — and it shows.`;
    bodyText = `${achievementText} Thank you for trusting Lansa as part of your career journey. Share it with someone who needs it — you could change their trajectory too.`;
    ctaText = 'See Your Impact';
  } else if (p.segment === 'green') {
    headerAccent = '#059669';
    accentBadge = '🔥 Engaged';
    subject = `You're on fire, ${p.name} — keep going`;
    headline = `You're building real momentum, ${p.name}.`;
    bodyText = nextFeature
      ? `You've been consistently using Lansa — that puts you ahead of most. Your next move to level up even further: try the ${nextFeature}. It could be the edge that gets you noticed.`
      : `You're using Lansa consistently and building a strong professional profile. Keep the momentum going — employers are actively searching.`;
    ctaText = nextFeature ? `Try ${nextFeature}` : 'Keep Going';
  } else if (p.segment === 'orange') {
    headerAccent = '#d97706';
    accentBadge = '⚡ Building';
    subject = `You've started on Lansa — here's your next power move, ${p.name}`;
    headline = `You're building momentum, ${p.name}.`;
    const doneCount = Object.keys(p.actionCounts).length;
    bodyText = nextFeature
      ? `You've used ${doneCount} feature${doneCount !== 1 ? 's' : ''} so far — that's a great start. Your next move: try the ${nextFeature}. It could be what gets you noticed by the right employer.`
      : `You're making real progress. Keep building your profile and stay visible to employers who are actively hiring.`;
    ctaText = nextFeature ? `Try ${nextFeature}` : 'Keep Going';
  } else {
    // Red / Drifting
    headerAccent = '#dc2626';
    accentBadge = '👋 Come Back';
    if (p.isEmployer) {
      subject = `Your hiring pipeline needs attention, ${p.name}`;
      headline = `Your candidates are waiting, ${p.name}.`;
      bodyText = nextFeature
        ? `You haven't ${nextFeature === 'Post a Job' ? 'posted a job yet' : nextFeature === 'Review Applications' ? 'reviewed your applications yet' : 'accepted a candidate yet'}. Your next great hire could already be in your pipeline.`
        : `It's been a while. Your hiring pipeline on Lansa is ready — come back and find your next hire.`;
      ctaText = 'View Pipeline';
    } else {
      subject = `Don't let your progress fade, ${p.name}`;
      headline = `Your career momentum is slipping, ${p.name}.`;
      bodyText = nextFeature
        ? `You haven't tried the ${nextFeature} yet — it's one of the most powerful tools for getting visible to employers. Take 5 minutes today to change that.`
        : `Your Lansa profile is set up and ready. Employers are actively looking for candidates like you — come back and stay visible.`;
      ctaText = nextFeature ? `Try ${nextFeature}` : 'Come Back';
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>${subject}</title></head>
<body style=\"margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;\">
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f4f5;padding:40px 20px;\">
    <tr><td align=\"center\">
      <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;\">
        <!-- Header -->
        <tr>
          <td style=\"background:${headerAccent};padding:32px 40px;text-align:center;\">
            <img src=\"data:image/svg+xml;base64,${LANSA_LOGO_B64}\" alt=\"Lansa\" width=\"28\" height=\"40\" style=\"display:inline-block;filter:brightness(0) invert(1);\" />
            ${accentBadge ? `<p style=\"color:#ffffff;opacity:0.9;font-size:12px;letter-spacing:1px;margin:10px 0 0;\">${accentBadge}</p>` : ''}
            <p style=\"color:#ffffff;opacity:0.6;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 0;\">Career Intelligence</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style=\"padding:40px 40px 32px;\">
            <h1 style=\"color:#111827;font-size:22px;font-weight:700;margin:0 0 14px;line-height:1.35;\">${headline}</h1>
            <p style=\"color:#374151;font-size:15px;line-height:1.65;margin:0 0 28px;\">${bodyText}</p>
            <a href=\"${DASHBOARD_URL}\" style=\"display:inline-block;background:${headerAccent};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;\">${ctaText} →</a>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style=\"padding:0 40px;\"><hr style=\"border:0;border-top:1px solid #e5e7eb;margin:0;\" /></td></tr>
        <!-- Footer -->
        <tr>
          <td style=\"padding:24px 40px;text-align:center;\">
            <p style=\"color:#9ca3af;font-size:11px;margin:0 0 4px;\">Lansa — Career Intelligence Platform</p>
            <p style=\"color:#9ca3af;font-size:11px;margin:0;\">You're receiving this because you have a Lansa account.<br>
            <a href=\"${DASHBOARD_URL}\" style=\"color:#6b7280;\">Manage preferences</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
