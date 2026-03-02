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

export function generateInvitationEmail(data: InvitationEmailData): { subject: string; html: string } {
  return {
    subject: `You're invited to join ${data.organizationName} on Lansa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .button { display: inline-block; background: #1a56db; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .button:hover { background: #1e40af; }
            .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 8px 0; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
            .footer a { color: #1a56db; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on Lansa.</p>
              <p>Your role: <span class="role-badge">${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</span></p>
              <p>Join your team to collaborate on hiring, manage job postings, and connect with top talent.</p>
              <div style="text-align: center;">
                <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">This invitation will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateRequestNotificationEmail(data: RequestEmailData): { subject: string; html: string } {
  return {
    subject: `New join request for ${data.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .button { display: inline-block; background: #1a56db; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .info-box { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Join Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.adminName},</p>
              <p>A new user has requested to join your organization:</p>
              <div class="info-box">
                <p style="margin: 8px 0;"><strong>Name:</strong> ${data.requesterName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${data.requesterEmail}</p>
                <p style="margin: 8px 0;"><strong>Organization:</strong> ${data.organizationName}</p>
              </div>
              <p>Review and manage this request in your organization settings.</p>
              <div style="text-align: center;">
                <a href="https://lansa.app/organization/settings?tab=requests" class="button">Review Request</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateApprovalEmail(data: ApprovalEmailData): { subject: string; html: string } {
  return {
    subject: `Welcome to ${data.organizationName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .button { display: inline-block; background: #10b981; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .button:hover { background: #059669; }
            .role-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 8px 0; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Request Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p>Great news! Your request to join <strong>${data.organizationName}</strong> has been approved.</p>
              <p>Your role: <span class="role-badge">${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</span></p>
              <p>You can now start collaborating with your team, create job postings, and manage applications.</p>
              <div style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateRejectionEmail(organizationName: string, recipientName: string): { subject: string; html: string } {
  return {
    subject: `Update on your request to join ${organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <p>Hi ${recipientName},</p>
              <p>Thank you for your interest in joining <strong>${organizationName}</strong>.</p>
              <p>Unfortunately, your request was not approved at this time. If you believe this was a mistake, please contact the organization administrator directly.</p>
              <p style="margin-top: 32px;">Best regards,<br><strong>The Lansa Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateSegmentChangeEmail(data: SegmentChangeEmailData): { subject: string; html: string } {
  const segmentConfig = {
    purple: {
      title: '🎉 You\'re an Advocate!',
      color: '#9333ea',
      gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
      message: 'Amazing work! You\'ve become one of our top advocates. Your active engagement and diverse use of Lansa features is inspiring.',
      tips: [
        'Share your success story with peers',
        'Help others by mentoring',
        'Explore advanced features'
      ]
    },
    green: {
      title: '🌱 You\'re Engaged!',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      message: 'Great to see you actively using Lansa! You\'re getting consistent value from the platform.',
      tips: [
        'Try new features you haven\'t explored',
        'Complete your profile for better opportunities',
        'Connect with more professionals'
      ]
    },
    orange: {
      title: '💡 Unlock More Potential',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      message: 'We\'ve noticed you\'re using some features, but there\'s so much more Lansa can offer you.',
      tips: [
        'Explore AI-powered profile insights',
        'Try our job matching feature',
        'Update your skills and experience',
        'Complete growth prompts in your dashboard'
      ]
    },
    red: {
      title: '👋 We Miss You!',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      message: 'It\'s been a while since we\'ve seen you on Lansa. We\'ve made improvements and would love to have you back!',
      tips: [
        'Check out our new features',
        'Update your profile to attract opportunities',
        'See personalized job recommendations',
        'Connect with your professional network'
      ]
    }
  };

  const config = segmentConfig[data.newSegment as keyof typeof segmentConfig];
  if (!config) {
    throw new Error(`Unknown segment: ${data.newSegment}`);
  }

  const tipsHtml = config.tips.map(tip => `<li style="margin: 8px 0;">${tip}</li>`).join('');

  return {
    subject: data.newSegment === 'red' ? 'We miss you on Lansa!' : 
             data.newSegment === 'orange' ? 'Unlock your full potential on Lansa' :
             data.newSegment === 'green' ? 'Great progress on Lansa!' :
             'You\'re a Lansa Advocate!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: ${config.gradient}; color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .button { display: inline-block; background: ${config.color}; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .tips-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color}; }
            .tips-box h3 { margin: 0 0 12px 0; color: ${config.color}; font-size: 18px; }
            .tips-box ul { margin: 0; padding-left: 24px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${config.title}</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p>${config.message}</p>
              <div class="tips-box">
                <h3>💡 Recommended Actions:</h3>
                <ul>
                  ${tipsHtml}
                </ul>
              </div>
              <div style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">Go to Your Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
              <p>Questions? Reply to this email - we're here to help!</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateChatRequestEmail(data: ChatRequestEmailData): { subject: string; html: string } {
  const orgLine = data.organizationName
    ? `from <strong>${data.organizationName}</strong>`
    : '';

  return {
    subject: `${data.requesterName} wants to connect with you on Lansa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #F2713B 0%, #e05a28 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .note-box { background: #fff7ed; border-left: 4px solid #F2713B; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; font-style: italic; color: #374151; }
            .button { display: inline-block; background: #F2713B; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Connection Request</h1>
              <p>Someone wants to connect with you</p>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p><strong>${data.requesterName}</strong> ${orgLine} has sent you a connection request on Lansa.</p>
              ${data.introNote ? `
              <div class="note-box">
                <p style="margin: 0; font-size: 15px;">"${data.introNote}"</p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #6b7280;">— ${data.requesterName}</p>
              </div>
              ` : ''}
              <p>Head to Lansa to review the request and decide whether to connect. Once you accept, a private chat will open between you both.</p>
              <div style="text-align: center;">
                <a href="https://lansa.app${data.actionUrl}" class="button">Review Request</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
              <p>You can manage your connection preferences in your Lansa settings.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateChatAcceptedEmail(data: ChatAcceptedEmailData): { subject: string; html: string } {
  const withOrg = data.organizationName
    ? `${data.otherPartyName} from ${data.organizationName}`
    : data.otherPartyName;

  return {
    subject: `Your chat with ${data.otherPartyName} is now open on Lansa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #2B7FE8 0%, #1a6cd4 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .highlight-box { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .highlight-box p { margin: 0; font-size: 18px; font-weight: 600; color: #1e40af; }
            .button { display: inline-block; background: #2B7FE8; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Connection Made!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p>Your connection with <strong>${withOrg}</strong> has been accepted — your private chat is now open!</p>
              <div class="highlight-box">
                <p>💬 Start your conversation now</p>
              </div>
              <p>Use the chat to discuss opportunities, ask questions, and take the next step together.</p>
              <div style="text-align: center;">
                <a href="https://lansa.app${data.threadUrl}" class="button">Open Chat</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function generateNewMessageEmail(data: NewMessageEmailData): { subject: string; html: string } {
  const fromOrg = data.organizationName
    ? `${data.senderName} · ${data.organizationName}`
    : data.senderName;

  return {
    subject: `New message from ${data.senderName} on Lansa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 32px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; }
            .content p { margin: 16px 0; font-size: 16px; }
            .message-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
            .message-box .sender { font-size: 13px; color: #6b7280; margin: 0 0 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            .message-box .body { font-size: 16px; color: #1f2937; margin: 0; }
            .button { display: inline-block; background: #1f2937; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p>You have a new message on Lansa:</p>
              <div class="message-box">
                <p class="sender">${fromOrg}</p>
                <p class="body">${data.messagePreview}${data.messagePreview.length >= 120 ? '…' : ''}</p>
              </div>
              <div style="text-align: center;">
                <a href="https://lansa.app${data.threadUrl}" class="button">Reply in Lansa</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>Lansa</strong> - The Future of Hiring</p>
              <p>To manage email preferences, visit your Lansa notification settings.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}
