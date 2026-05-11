const ORANGE = 'hsl(14, 90%, 60%)';
const DEEP_BLUE = '#191f71';
const SOFT_BG = '#f8fafc';
const TEXT = '#1e293b';
const MUTED = '#64748b';

const APP_URL = 'https://lansa.online';

export interface MissingStep {
  key: string;
  label: string;
  cta_route?: string;
}

export interface NudgeContext {
  firstName?: string | null;
  missingSteps: MissingStep[];
  score: number;
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${SOFT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${TEXT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT_BG};padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
<tr><td style="background:${DEEP_BLUE};padding:24px 32px;">
<span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Lansa</span>
</td></tr>
<tr><td style="padding:36px 32px 28px;">${bodyHtml}</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #f1f5f9;">
<p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
You signed up for Lansa with this email. If you're no longer interested, just ignore this — we'll stop emailing automatically.
</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function cta(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0"><tr><td style="background:${ORANGE};border-radius:10px;">
  <a href="${href}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

function missingList(steps: MissingStep[]): string {
  const top = steps.slice(0, 3);
  if (!top.length) return '';
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin:0 0 24px;">
    <tr><td style="padding:18px 22px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:${ORANGE};text-transform:uppercase;letter-spacing:0.4px;">What's still missing</p>
      ${top.map(s => `<p style="margin:6px 0;font-size:14px;color:#7c2d12;">→ ${s.label}</p>`).join('')}
    </td></tr></table>`;
}

const greeting = (name?: string | null) => (name ? `Hi ${name},` : 'Hi there,');

export interface NudgeTemplate {
  subject: string;
  html: string;
}

export function buildNudge(step: number, ctx: NudgeContext): NudgeTemplate {
  const url = `${APP_URL}/profile`;
  const name = ctx.firstName?.trim() || null;

  switch (step) {
    case 1:
      return {
        subject: 'Your Lansa profile is waiting',
        html: shell('Your profile is waiting', `
<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${DEEP_BLUE};letter-spacing:-0.5px;">You started — let's finish it</h1>
<p style="margin:0 0 20px;font-size:15px;color:${TEXT};line-height:1.6;">${greeting(name)} you signed up for Lansa but your profile is only <strong>${ctx.score}% ready</strong>. A few minutes is all it takes to get matched with real opportunities.</p>
${missingList(ctx.missingSteps)}
${cta('Finish my profile →', url)}
<p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Takes 2–3 minutes. No CV needed.</p>`),
      };
    case 2:
      return {
        subject: `You're ${ctx.score}% there — here's what's left`,
        html: shell('What you are missing', `
<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${DEEP_BLUE};letter-spacing:-0.5px;">3 things between you and getting found</h1>
<p style="margin:0 0 20px;font-size:15px;color:${TEXT};line-height:1.6;">${greeting(name)} employers can't match you with roles yet because your profile is incomplete. Here's exactly what's blocking you:</p>
${missingList(ctx.missingSteps)}
${cta('Fix it now →', url)}`),
      };
    case 3:
      return {
        subject: 'Candidates who finish get 4× more views',
        html: shell('Complete profiles win', `
<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${DEEP_BLUE};letter-spacing:-0.5px;">Complete profiles get found</h1>
<p style="margin:0 0 20px;font-size:15px;color:${TEXT};line-height:1.6;">${greeting(name)} candidates with a finished profile receive significantly more views from employers on Lansa. Yours is at <strong>${ctx.score}%</strong>.</p>
${missingList(ctx.missingSteps)}
${cta('Complete my profile →', url)}`),
      };
    case 4:
      return {
        subject: 'Last push — your Lansa profile',
        html: shell('Last push', `
<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${DEEP_BLUE};letter-spacing:-0.5px;">We'll stop emailing soon</h1>
<p style="margin:0 0 20px;font-size:15px;color:${TEXT};line-height:1.6;">${greeting(name)} this is one of the last nudges we'll send. If you still want a shot at the roles on Lansa, take 3 minutes to finish your profile.</p>
${missingList(ctx.missingSteps)}
${cta('Finish now →', url)}`),
      };
    case 5:
    default:
      return {
        subject: 'Final email — your Lansa profile',
        html: shell('Goodbye for now', `
<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${DEEP_BLUE};letter-spacing:-0.5px;">We won't email again</h1>
<p style="margin:0 0 20px;font-size:15px;color:${TEXT};line-height:1.6;">${greeting(name)} this is our final nudge. Your profile is still waiting if you change your mind. After this we'll stop emailing about onboarding.</p>
${cta('Open Lansa →', url)}`),
      };
  }
}

export const STEP_DELAYS_HOURS: Record<number, number> = {
  1: 24,
  2: 72,
  3: 24 * 7,
  4: 24 * 14,
  5: 24 * 30,
};

export const STEP_TEMPLATE_KEY: Record<number, string> = {
  1: 'nudge_day1_welcome_back',
  2: 'nudge_day3_what_youre_missing',
  3: 'nudge_day7_social_proof',
  4: 'nudge_day14_last_push',
  5: 'nudge_day30_goodbye',
};