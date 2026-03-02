import { Resend } from "npm:resend@4.0.0";
import { 
  generateInvitationEmail,
  generateRequestNotificationEmail,
  generateApprovalEmail,
  generateRejectionEmail,
  generateSegmentChangeEmail,
  type InvitationEmailData,
  type RequestEmailData,
  type ApprovalEmailData,
  type SegmentChangeEmailData
} from "./emailTemplates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { subject, html } = generateInvitationEmail(data);
  
  const { error } = await resend.emails.send({
    from: "Lansa <noreply@notification.lansa.online>",
    to: [data.recipientEmail],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send invitation:', error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  console.log(`[emailService] Invitation sent to ${data.recipientEmail}`);
}

export async function sendRequestNotification(data: RequestEmailData, adminEmail: string): Promise<void> {
  const { subject, html } = generateRequestNotificationEmail(data);
  
  const { error } = await resend.emails.send({
    from: "Lansa <noreply@notification.lansa.online>",
    to: [adminEmail],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send request notification:', error);
    throw new Error(`Failed to send request notification: ${error.message}`);
  }

  console.log(`[emailService] Request notification sent to ${adminEmail}`);
}

export async function sendApprovalEmail(data: ApprovalEmailData, recipientEmail: string): Promise<void> {
  const { subject, html } = generateApprovalEmail(data);
  
  const { error } = await resend.emails.send({
    from: "Lansa <noreply@notification.lansa.online>",
    to: [recipientEmail],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send approval email:', error);
    throw new Error(`Failed to send approval email: ${error.message}`);
  }

  console.log(`[emailService] Approval email sent to ${recipientEmail}`);
}

export async function sendRejectionEmail(organizationName: string, recipientName: string, recipientEmail: string): Promise<void> {
  const { subject, html } = generateRejectionEmail(organizationName, recipientName);
  
  const { error } = await resend.emails.send({
    from: "Lansa <noreply@notification.lansa.online>",
    to: [recipientEmail],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send rejection email:', error);
    throw new Error(`Failed to send rejection email: ${error.message}`);
  }

  console.log(`[emailService] Rejection email sent to ${recipientEmail}`);
}

export async function sendSegmentChangeEmail(data: SegmentChangeEmailData): Promise<void> {
  const { subject, html } = generateSegmentChangeEmail(data);
  
  const { error } = await resend.emails.send({
    from: "Lansa <noreply@notification.lansa.online>",
    to: [data.recipientEmail],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Failed to send segment change email:', error);
    throw new Error(`Failed to send segment change email: ${error.message}`);
  }

  console.log(`[emailService] Segment change email sent to ${data.recipientEmail} (${data.oldSegment} → ${data.newSegment})`);
}
