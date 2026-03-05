import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SegmentChangePayload {
  user_id: string;
  old_segment: string | null;
  new_segment: string;
}

// Minimum days between nudge emails per user
const MIN_EMAIL_GAP_DAYS = 5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const payload: SegmentChangePayload = await req.json();
    const { user_id, old_segment, new_segment } = payload;

    console.log(`[send-segment-email] ${old_segment} → ${new_segment} for user ${user_id}`);

    // Skip no-change or new-user (no old segment)
    if (!old_segment || old_segment === new_segment) {
      return jsonResponse({ message: 'No meaningful transition' });
    }

    // Only email on these transitions
    const shouldSendEmail =
      new_segment === 'red' ||
      new_segment === 'orange' ||
      (old_segment === 'red' && (new_segment === 'green' || new_segment === 'orange'));

    if (!shouldSendEmail) {
      return jsonResponse({ message: 'Transition not configured for email' });
    }

    // Enforce minimum gap between emails
    const { data: recentEmail } = await supabase
      .from('segment_email_log')
      .select('email_sent_at')
      .eq('user_id', user_id)
      .gt('email_sent_at', new Date(Date.now() - MIN_EMAIL_GAP_DAYS * 24 * 60 * 60 * 1000).toISOString())
      .order('email_sent_at', { ascending: false })
      .limit(1)
      .single();

    if (recentEmail) {
      console.log(`[send-segment-email] Skipping — email sent within ${MIN_EMAIL_GAP_DAYS}d for user ${user_id}`);
      return jsonResponse({ message: 'Rate-limited: recent email exists' });
    }

    // Fetch user profile + action signals
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, email, certified, visible_to_employers')
      .eq('user_id', user_id)
      .single();

    if (!profile?.email) {
      return jsonResponse({ message: 'User has no email' });
    }

    // Check role (employer vs seeker)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id);

    const isEmployer = roles?.some(r => ['employer', 'business'].includes(r.role));

    // Get action signal counts
    const { data: actions } = await supabase
      .from('user_actions')
      .select('action_type, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    const actionCounts: Record<string, number> = {};
    actions?.forEach(a => {
      actionCounts[a.action_type] = (actionCounts[a.action_type] || 0) + 1;
    });

    // Build role-specific email content
    const emailContent = buildEmailContent({
      name: profile.name || 'there',
      email: profile.email,
      oldSegment: old_segment,
      newSegment: new_segment,
      isEmployer: !!isEmployer,
      actionCounts,
      certified: !!profile.certified,
      visibleToEmployers: !!profile.visible_to_employers,
    });

    const { error } = await resend.emails.send({
      from: 'Lansa <noreply@notification.lansa.online>',
      to: [profile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[send-segment-email] Resend error:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    console.log(`[send-segment-email] Sent to ${profile.email} (${old_segment} → ${new_segment})`);
    return jsonResponse({ success: true, message: `Email sent to ${profile.email}` });

  } catch (error: any) {
    console.error('[send-segment-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
  email: string;
  oldSegment: string;
  newSegment: string;
  isEmployer: boolean;
  actionCounts: Record<string, number>;
  certified: boolean;
  visibleToEmployers: boolean;
}

function buildEmailContent(p: EmailParams): { subject: string; html: string } {
  const dashboardUrl = 'https://lansa.online/dashboard';

  // Determine what the user HAS and HAS NOT done
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

  // Segment-specific messaging
  let subject = '';
  let headline = '';
  let bodyText = '';
  let ctaText = 'Return to Lansa';

  if (p.newSegment === 'red') {
    if (p.isEmployer) {
      subject = `Your hiring pipeline needs attention, ${p.name}`;
      headline = `Your candidates are waiting, ${p.name}.`;
      bodyText = nextFeature
        ? `You haven't ${nextFeature === 'Post a Job' ? 'posted a job yet' : nextFeature === 'Review Applications' ? 'reviewed your applications yet' : 'accepted a candidate yet'}. Your next hire could already be in your pipeline.`
        : `It's been a while since you've been active on Lansa. Your next great hire is waiting.`;
      ctaText = 'View My Pipeline';
    } else {
      subject = `Your career momentum is stalling, ${p.name}`;
      headline = `Don't let your progress fade, ${p.name}.`;
      bodyText = nextFeature
        ? `You haven't tried the ${nextFeature} yet — it's one of the most powerful tools for getting visible to employers. Take 5 minutes today.`
        : `Your Lansa profile is set up, but you haven't logged back in recently. Employers are actively looking for candidates like you.`;
      ctaText = nextFeature ? `Try ${nextFeature}` : 'Continue Building';
    }
  } else if (p.newSegment === 'orange') {
    if (p.isEmployer) {
      subject = `You're getting started — here's your next step`;
      headline = `Good start, ${p.name}. Here's what to do next.`;
      bodyText = nextFeature
        ? `To get the most from Lansa, your next step is to ${nextFeature === 'Post a Job' ? 'post your first job listing' : nextFeature === 'Review Applications' ? 'review your incoming applications' : 'accept your first candidate'}. It only takes a few minutes.`
        : `You're making progress on Lansa. Keep your pipeline moving to find your next great hire.`;
      ctaText = 'Continue';
    } else {
      subject = `You've started on Lansa — here's your next power move`;
      headline = `You're building momentum, ${p.name}.`;
      const doneCount = Object.keys(p.actionCounts).length;
      bodyText = nextFeature
        ? `You've used ${doneCount} feature${doneCount !== 1 ? 's' : ''} so far. Your next move: try the ${nextFeature}. It could be what gets you noticed by the right employer.`
        : `You're doing great. Keep building your career profile and stay visible to employers.`;
      ctaText = nextFeature ? `Unlock ${nextFeature}` : 'Keep Going';
    }
  } else {
    // Recovery (red → green/orange)
    subject = `You're back — and Lansa noticed 🎉`;
    headline = `Welcome back, ${p.name}!`;
    bodyText = `Your engagement is growing. ${nextFeature ? `Next up: try the ${nextFeature} to keep the momentum going.` : 'Keep using Lansa to stay visible and move your career forward.'}`;
    ctaText = 'See What\'s New';
  }

  const LANSA_LOGO_B64 = 'PHN2ZyB3aWR0aD0iMTk1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE5NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOTIuMjQgNzkuNDI5N0MxOTMuMzE1IDc5LjM3OCAxOTQuMjI1IDgwLjE3ODYgMTk0LjI5OSA4MS4yNDAyQzE5OC4yODEgMTM4LjI1NiAxNjIuNDQ0IDIwMC45OTggMTE1LjY0IDI1Mi43NDVDMTE0LjkzNCAyNTMuNTI1IDExMy42MzMgMjUyLjgyIDExMy44ODkgMjUxLjgwNUMxMTcuOTYgMjM1LjY1MiAxMTguNjA0IDIyMS4yODggMTE1LjgyMSAyMDguNzFDOTMuNTU4MyAyNDQuNjI5IDQxLjQ2MjQgMjcyLjE4NCAzLjE3OTY5IDI3Ny45NjRDMC4zODIgMjc4LjM4NiAtMS4wOTQ4NyAyNzUuMDgxIDAuOTYwOTM4IDI3My4xNTdDNTMuNjI4OCAyMjMuODgzIDcyLjMzNjIgMjAyLjE3NCA5MC4yMTM5IDE3NC4xNDNDNjMuOTk2NyAxODguMDA1IDQyLjMzNDIgMTk3Ljc4OCAyMi4wOTY3IDIwMS4yMThDMTkuOTIxNSAyMDEuNTg2IDE4LjIxMzkgMTk5LjQ4MiAxOC45NDYzIDE5Ny40MjRDNTEuNzQ5MSAxMDUuMjUyIDEzMC43MiA4Mi4zODkyIDE5Mi4yNCA3OS40Mjk3Wk0xMTUuMTcxIDBDMTM0LjkxMSAwIDE1MC45MTQgMTYuODkxNiAxNTAuOTE0IDM3LjcyODVDMTUwLjkxNCA1OC41NjU2IDEzNC45MTEgNzUuNDU4IDExNS4xNzEgNzUuNDU4Qzk1LjQzMDYgNzUuNDU3OSA3OS40Mjc3IDU4LjU2NTUgNzkuNDI3NyAzNy43Mjg1Qzc5LjQyNzkgMTYuODkxNyA5NS40MzA3IDAuMDAwMTA4OTUgMTE1LjE3MSAwWiIgZmlsbD0iIzFBMUY3MSIvPgo8L3N2Zz4=';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1A1F71;padding:32px 40px;text-align:center;">
            <img src="data:image/svg+xml;base64,${LANSA_LOGO_B64}" alt="Lansa" width="32" height="46" style="display:inline-block;" />
            <p style="color:#ffffff;opacity:0.7;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:12px 0 0;">Career Intelligence</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="color:#1A1F71;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">${headline}</h1>
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 28px;">${bodyText}</p>
            <a href="${dashboardUrl}" style="display:inline-block;background:#1A1F71;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;">${ctaText} →</a>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:0;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">You're receiving this because you have a Lansa account.<br>
            <a href="${dashboardUrl}" style="color:#6b7280;">Manage preferences</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
