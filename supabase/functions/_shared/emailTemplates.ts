export interface InvitationEmailData {
  organizationName: string;
  inviterName: string;
  recipientEmail: string;
  role: string;
  inviteUrl: string;
}

export interface RequestEmailData {
  organizationName: string;
  requesterName: string;
  requesterEmail: string;
  adminName: string;
}

export interface ApprovalEmailData {
  organizationName: string;
  recipientName: string;
  role: string;
  dashboardUrl: string;
}

export interface SegmentChangeEmailData {
  recipientName: string;
  recipientEmail: string;
  oldSegment: string | null;
  newSegment: string;
  dashboardUrl: string;
}

export interface ChatRequestEmailData {
  recipientName: string;
  recipientEmail: string;
  requesterName: string;
  organizationName?: string;
  organizationLogo?: string;
  introNote?: string;
  actionUrl: string;
}

export interface ChatAcceptedEmailData {
  recipientName: string;
  recipientEmail: string;
  otherPartyName: string;
  organizationName?: string;
  threadUrl: string;
}

export interface NewMessageEmailData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  organizationName?: string;
  messagePreview: string;
  threadUrl: string;
}

export interface EmployerInterestEmailData {
  recipientName: string;
  recipientEmail: string;
  dashboardUrl: string;
  employerName?: string;
}

export interface MatchCreatedEmailData {
  recipientName: string;
  recipientEmail: string;
  otherPartyName: string;
  threadUrl: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const LANSA_LOGO_B64 = 'PHN2ZyB3aWR0aD0iMTk1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE5NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOTIuMjQgNzkuNDI5N0MxOTMuMzE1IDc5LjM3OCAxOTQuMjI1IDgwLjE3ODYgMTk0LjI5OSA4MS4yNDAyQzE5OC4yODEgMTM4LjI1NiAxNjIuNDQ0IDIwMC45OTggMTE1LjY0IDI1Mi43NDVDMTE0LjkzNCAyNTMuNTI1IDExMy42MzMgMjUyLjgyIDExMy44ODkgMjUxLjgwNUMxMTcuOTYgMjM1LjY1MiAxMTguNjA0IDIyMS4yODggMTE1LjgyMSAyMDguNzFDOTMuNTU4MyAyNDQuNjI5IDQxLjQ2MjQgMjcyLjE4NCAzLjE3OTY5IDI3Ny45NjRDMC4zODIgMjc4LjM4NiAtMS4wOTQ4NyAyNzUuMDgxIDAuOTYwOTM4IDI3My4xNTdDNTMuNjI4OCAyMjMuODgzIDcyLjMzNjIgMjAyLjE3NCA5MC4yMTM5IDE3NC4xNDNDNjMuOTk2NyAxODguMDA1IDQyLjMzNDIgMTk3Ljc4OCAyMi4wOTY3IDIwMS4yMThDMTkuOTIxNSAyMDEuNTg2IDE4LjIxMzkgMTk5LjQ4MiAxOC45NDYzIDE5Ny40MjRDNTEuNzQ5MSAxMDUuMjUyIDEzMC43MiA4Mi4zODkyIDE5Mi4yNCA3OS40Mjk3Wk0xMTUuMTcxIDBDMTM0LjkxMSAwIDE1MC45MTQgMTYuODkxNiAxNTAuOTE0IDM3LjcyODVDMTUwLjkxNCA1OC41NjU2IDEzNC45MTEgNzUuNDU4IDExNS4xNzEgNzUuNDU4Qzk1LjQzMDYgNzUuNDU3OSA3OS40Mjc3IDU4LjU2NTUgNzkuNDI3NyAzNy43Mjg1Qzc5LjQyNzkgMTYuODkxNyA5NS40MzA3IDAuMDAwMTA4OTUgMTE1LjE3MSAwWiIgZmlsbD0iIzFBMUY3MSIvPgo8L3N2Zz4=';

function logoHtml(): string {
  return `<div style="display:inline-block;background:#ffffff;border-radius:50px;padding:8px 16px;margin-bottom:14px;">
    <img src="data:image/svg+xml;base64,${LANSA_LOGO_B64}" alt="Lansa" width="32" height="46" style="display:block;border:0;outline:none;" />
  </div>`;
}

function wrapper(headerBg: string, headerContent: string, bodyContent: string, footerNote: string = '', contentBg: string = '#ffffff'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lansa</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <!-- HEADER -->
        <tr>
          <td style="background-color:${headerBg};padding:40px 36px 32px;border-radius:12px 12px 0 0;text-align:center;">
            ${headerContent}
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="background-color:${contentBg};padding:36px 36px 28px;border-radius:0 0 12px 12px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="padding:24px 36px;text-align:center;">
            <p style="margin:0 0 6px;color:#6b7280;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
              <strong style="color:#374151;">Lansa</strong> &mdash; The Future of Hiring
            </p>
            ${footerNote ? `<p style="margin:0;color:#9ca3af;font-size:12px;font-family:Arial,Helvetica,sans-serif;">${footerNote}</p>` : ''}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, url: string, bg: string = '#1a56db'): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
    <tr>
      <td align="center" style="background-color:${bg};border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function infoTable(rows: Array<[string, string]>): string {
  const cells = rows.map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;background-color:#f9fafb;font-size:14px;font-weight:700;color:#374151;font-family:Arial,Helvetica,sans-serif;white-space:nowrap;border-bottom:1px solid #e5e7eb;">${k}</td>
      <td style="padding:8px 12px;background-color:#f9fafb;font-size:14px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e5e7eb;">${v}</td>
    </tr>`).join('');
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:20px 0;">${cells}</table>`;
}

function highlightBox(text: string, bg: string, borderColor: string, textColor: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
    <tr>
      <td style="background-color:${bg};border-left:4px solid ${borderColor};border-radius:0 8px 8px 0;padding:16px 20px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:${textColor};font-family:Arial,Helvetica,sans-serif;">${text}</p>
      </td>
    </tr>
  </table>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">${text}</p>`;
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${color};padding:3px 12px;border-radius:6px;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">${text}</span>`;
}

// ─── Templates ─────────────────────────────────────────────────────────────────

export function generateInvitationEmail(data: InvitationEmailData): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">🎉 You're Invited!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Join your team on Lansa</p>`;

  const roleLabel = data.role.charAt(0).toUpperCase() + data.role.slice(1);
  const body = `
    ${p(`Hi there,`)}
    ${p(`<strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on Lansa.`)}
    ${infoTable([['Organization', data.organizationName], ['Your Role', roleLabel], ['Invited by', data.inviterName]])}
    ${p('Join your team to collaborate on hiring, manage job postings, and connect with top talent.')}
    ${ctaButton('Accept Invitation', data.inviteUrl, '#1a56db')}
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;">This invitation expires in 7 days.</p>`;

  return {
    subject: `You're invited to join ${data.organizationName} on Lansa`,
    html: wrapper('#1a56db', header, body, "If you didn't expect this invitation, you can safely ignore this email.")
  };
}

export function generateRequestNotificationEmail(data: RequestEmailData): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">📬 New Join Request</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Action required in your organization</p>`;

  const body = `
    ${p(`Hi ${data.adminName},`)}
    ${p('A new user has requested to join your organization:')}
    ${infoTable([['Name', data.requesterName], ['Email', data.requesterEmail], ['Organization', data.organizationName]])}
    ${p('Review and manage this request in your organization settings.')}
    ${ctaButton('Review Request', 'https://lansa.online/organization/settings?tab=requests', '#1a56db')}`;

  return {
    subject: `New join request for ${data.organizationName}`,
    html: wrapper('#1a56db', header, body)
  };
}

export function generateApprovalEmail(data: ApprovalEmailData): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">✅ Request Approved!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Welcome to ${data.organizationName}</p>`;

  const roleLabel = data.role.charAt(0).toUpperCase() + data.role.slice(1);
  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(`Great news! Your request to join <strong>${data.organizationName}</strong> has been approved.`)}
    ${infoTable([['Organization', data.organizationName], ['Your Role', roleLabel]])}
    ${p('You can now start collaborating with your team, create job postings, and manage applications.')}
    ${ctaButton('Go to Dashboard', data.dashboardUrl, '#059669')}`;

  return {
    subject: `Welcome to ${data.organizationName}!`,
    html: wrapper('#059669', header, body)
  };
}

export function generateRejectionEmail(organizationName: string, recipientName: string): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Update on Your Request</h1>`;

  const body = `
    ${p(`Hi ${recipientName},`)}
    ${p(`Thank you for your interest in joining <strong>${organizationName}</strong>.`)}
    ${p('Unfortunately, your request was not approved at this time. If you believe this was a mistake, please contact the organization administrator directly.')}
    <p style="margin:32px 0 0;font-size:15px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">Best regards,<br><strong>The Lansa Team</strong></p>`;

  return {
    subject: `Update on your request to join ${organizationName}`,
    html: wrapper('#374151', header, body)
  };
}

export function generateSegmentChangeEmail(data: SegmentChangeEmailData): { subject: string; html: string } {
  const segmentConfig = {
    purple: {
      title: "🎉 You're an Advocate!",
      headerBg: '#6d28d9',
      contentBg: '#faf5ff',
      accentColor: '#7e22ce',
      highlightBg: '#f3e8ff',
      highlightBorder: '#7e22ce',
      highlightText: '#4c1d95',
      message: "Amazing work! You've become one of our top advocates. Your active engagement and diverse use of Lansa features is inspiring.",
      tips: ['Share your success story with peers', 'Help others by mentoring', 'Explore advanced features'],
      sub: "You're at the top of your game on Lansa",
    },
    green: {
      title: '🌱 You\'re Engaged!',
      headerBg: '#047857',
      contentBg: '#f0fdf4',
      accentColor: '#059669',
      highlightBg: '#d1fae5',
      highlightBorder: '#059669',
      highlightText: '#065f46',
      message: "Great to see you actively using Lansa! You're getting consistent value from the platform.",
      tips: ["Try new features you haven't explored", 'Complete your profile for better opportunities', 'Connect with more professionals'],
      sub: 'Keep up the great momentum',
    },
    orange: {
      title: '💡 Unlock More Potential',
      headerBg: '#b45309',
      contentBg: '#fffbeb',
      accentColor: '#d97706',
      highlightBg: '#fef3c7',
      highlightBorder: '#d97706',
      highlightText: '#92400e',
      message: "We've noticed you're using some features, but there's so much more Lansa can offer you.",
      tips: ['Explore AI-powered profile insights', 'Try our job matching feature', 'Update your skills and experience', 'Complete growth prompts in your dashboard'],
      sub: "There's so much more waiting for you",
    },
    red: {
      title: '👋 We Miss You!',
      headerBg: '#b91c1c',
      contentBg: '#fff5f5',
      accentColor: '#dc2626',
      highlightBg: '#fee2e2',
      highlightBorder: '#dc2626',
      highlightText: '#7f1d1d',
      message: "It's been a while since we've seen you on Lansa. We've made improvements and would love to have you back!",
      tips: ['Check out our new features', 'Update your profile to attract opportunities', 'See personalized job recommendations', 'Connect with your professional network'],
      sub: "We've made improvements — come see",
    }
  };

  const config = segmentConfig[data.newSegment as keyof typeof segmentConfig];
  if (!config) throw new Error(`Unknown segment: ${data.newSegment}`);

  const tipsList = config.tips.map(t => `<li style="margin:6px 0;font-size:14px;color:#374151;font-family:Arial,Helvetica,sans-serif;">${t}</li>`).join('');

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${config.title}</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">${config.sub}</p>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(config.message)}
    ${highlightBox('💡 Recommended Actions:', config.highlightBg, config.highlightBorder, config.highlightText)}
    <ul style="margin:0 0 20px;padding-left:22px;">${tipsList}</ul>
    ${ctaButton('Go to Your Dashboard', data.dashboardUrl, config.accentColor)}`;

  const subjectMap: Record<string, string> = {
    red: 'We miss you on Lansa!',
    orange: 'Unlock your full potential on Lansa',
    green: 'Great progress on Lansa!',
    purple: "You're a Lansa Advocate!",
  };

  return {
    subject: subjectMap[data.newSegment] || 'Your Lansa journey update',
    html: wrapper(config.headerBg, header, body, "Questions? Reply to this email — we're here to help!", config.contentBg)
  };
}

export function generateChatRequestEmail(data: ChatRequestEmailData): { subject: string; html: string } {
  const orgLine = data.organizationName ? ` from <strong>${data.organizationName}</strong>` : '';

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">✉️ Connection Request</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Someone wants to connect with you</p>`;

  const noteBlock = data.introNote ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td style="background-color:#eff6ff;border-left:4px solid #1a56db;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:15px;color:#1f2937;font-style:italic;font-family:Arial,Helvetica,sans-serif;">"${data.introNote}"</p>
          <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">— ${data.requesterName}</p>
        </td>
      </tr>
    </table>` : '';

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(`<strong>${data.requesterName}</strong>${orgLine} has sent you a connection request on Lansa.`)}
    ${noteBlock}
    ${p('Head to Lansa to review the request and decide whether to connect. Once you accept, a private chat will open between you both.')}
    ${ctaButton('Review Request', `https://lansa.online${data.actionUrl}`, '#1a56db')}`;

  return {
    subject: `${data.requesterName} wants to connect with you on Lansa`,
    html: wrapper('#1a56db', header, body, 'You can manage your connection preferences in your Lansa settings.')
  };
}

export function generateChatAcceptedEmail(data: ChatAcceptedEmailData): { subject: string; html: string } {
  const withOrg = data.organizationName ? `${data.otherPartyName} from ${data.organizationName}` : data.otherPartyName;

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">🎉 Connection Made!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Your chat is now open</p>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(`Your connection with <strong>${withOrg}</strong> has been accepted — your private chat is now open!`)}
    ${highlightBox('💬 Start your conversation now — introduce yourself and explore the opportunity together.', '#eff6ff', '#1a56db', '#1e40af')}
    ${p('Use the chat to discuss opportunities, ask questions, and take the next step together.')}
    ${ctaButton('Open Chat', `https://lansa.online${data.threadUrl}`, '#1a56db')}`;

  return {
    subject: `Your chat with ${data.otherPartyName} is now open on Lansa`,
    html: wrapper('#1a56db', header, body)
  };
}

export function generateNewMessageEmail(data: NewMessageEmailData): { subject: string; html: string } {
  const fromOrg = data.organizationName ? `${data.senderName} · ${data.organizationName}` : data.senderName;
  const preview = data.messagePreview.length >= 120 ? data.messagePreview.slice(0, 120) + '…' : data.messagePreview;

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">💬 New Message</h1>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p('You have a new message on Lansa:')}
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;">
      <tr>
        <td style="padding:12px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;border-radius:8px 8px 0 0;">
          <p style="margin:0;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">${fromOrg}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background-color:#ffffff;border-radius:0 0 8px 8px;">
          <p style="margin:0;font-size:15px;color:#1f2937;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${preview}</p>
        </td>
      </tr>
    </table>
    ${ctaButton('Reply in Lansa', `https://lansa.online${data.threadUrl}`, '#1f2937')}`;

  return {
    subject: `New message from ${data.senderName} on Lansa`,
    html: wrapper('#1f2937', header, body, 'To manage email preferences, visit your Lansa notification settings.')
  };
}

export function generateEmployerInterestEmail(data: EmployerInterestEmailData): { subject: string; html: string } {
  const employerLine = data.employerName
    ? `<strong>${data.employerName}</strong> liked your profile on Lansa and expressed interest in connecting with you!`
    : 'Great news — an employer on Lansa liked your profile and expressed interest in connecting with you!';

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">💚 An Employer is Interested!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Your profile caught someone's attention</p>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(employerLine)}
    ${highlightBox('🎯 If you like them back, you\'ll match and a private chat will open automatically.', '#d1fae5', '#10b981', '#065f46')}
    ${p("Head to your dashboard to see who's interested in you and decide if you want to connect.")}
    ${ctaButton('View My Dashboard', `https://lansa.online${data.dashboardUrl}`, '#059669')}`;

  const subject = data.employerName
    ? `💚 ${data.employerName} is interested in your profile on Lansa`
    : `💚 An employer is interested in your profile on Lansa`;

  return {
    subject,
    html: wrapper('#059669', header, body, 'You can manage your notification preferences in your Lansa settings.')
  };
}

export function generateEmployerNudgeEmail(data: EmployerInterestEmailData): { subject: string; html: string } {
  const nudgeLine = data.employerName
    ? `<strong>${data.employerName}</strong> sent you <strong>Super Interest</strong> on Lansa — they're especially excited about your profile and really want to connect!`
    : 'An employer on Lansa sent you <strong>Super Interest</strong> — this means they\'re especially excited about your profile and really want to connect!';

  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">⚡ Super Interest Received!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">An employer really wants to connect with you</p>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(nudgeLine)}
    ${highlightBox('⚡ Super Interest is a priority signal — don\'t miss this opportunity!', '#fef3c7', '#f59e0b', '#92400e')}
    ${p("Visit your dashboard to discover who sent you super interest and decide if you'd like to connect back.")}
    ${ctaButton('View My Dashboard', `https://lansa.online${data.dashboardUrl}`, '#d97706')}`;

  const subject = data.employerName
    ? `⚡ ${data.employerName} sent you super interest on Lansa`
    : `⚡ An employer sent you super interest on Lansa`;

  return {
    subject,
    html: wrapper('#d97706', header, body, 'You can manage your notification preferences in your Lansa settings.')
  };
}

export function generateMatchCreatedEmail(data: MatchCreatedEmailData): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:30px;font-weight:900;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">🎉 It's a Match!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">Both of you expressed mutual interest</p>`;

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(`Exciting news — you and <strong>${data.otherPartyName}</strong> have mutually matched on Lansa! A private chat is now open between you both.`)}
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
      <tr>
        <td style="background-color:#ede9fe;border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#4c1d95;font-family:Arial,Helvetica,sans-serif;">You ❤️ ${data.otherPartyName}</p>
          <p style="margin:0;font-size:14px;color:#6d28d9;font-family:Arial,Helvetica,sans-serif;">Your chat is ready — say hello!</p>
        </td>
      </tr>
    </table>
    ${p("This is your moment to make a great first impression. Start a conversation, ask questions, and explore the opportunity together.")}
    ${ctaButton('Open Chat Now', `https://lansa.online${data.threadUrl}`, '#6d28d9')}`;

  return {
    subject: `🎉 It's a Match! You and ${data.otherPartyName} matched on Lansa`,
    html: wrapper('#6d28d9', header, body, 'You can manage your notification preferences in your Lansa settings.')
  };
}

// ─── Job Application Received (employer notification) ─────────────────────────

export interface JobApplicationEmailData {
  recipientName: string;
  recipientEmail: string;
  applicantName: string;
  jobTitle: string;
  coverNote?: string;
  applicantsUrl: string;
}

export function generateJobApplicationEmail(data: JobApplicationEmailData): { subject: string; html: string } {
  const header = `
    ${logoHtml()}
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">📋 New Application!</h1>
    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.88);font-family:Arial,Helvetica,sans-serif;">A candidate applied to your job post</p>`;

  const coverNoteBlock = data.coverNote ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td style="background-color:#eff6ff;border-left:4px solid #1a56db;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,Helvetica,sans-serif;">Cover Note</p>
          <p style="margin:0;font-size:15px;color:#1f2937;font-style:italic;font-family:Arial,Helvetica,sans-serif;">"${data.coverNote.slice(0, 200)}${data.coverNote.length > 200 ? '…' : ''}"</p>
        </td>
      </tr>
    </table>` : '';

  const body = `
    ${p(`Hi ${data.recipientName},`)}
    ${p(`<strong>${data.applicantName}</strong> has applied for your job posting:`)}
    ${infoTable([['Job Title', data.jobTitle], ['Applicant', data.applicantName]])}
    ${coverNoteBlock}
    ${p('Review their full profile and application in your dashboard to take action.')}
    ${ctaButton('View Application', data.applicantsUrl, '#1a56db')}`;

  return {
    subject: `New application for "${data.jobTitle}" from ${data.applicantName}`,
    html: wrapper('#1a56db', header, body, 'You can manage all job applications from your Lansa employer dashboard.')
  };
}
