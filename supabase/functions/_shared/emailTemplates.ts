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
