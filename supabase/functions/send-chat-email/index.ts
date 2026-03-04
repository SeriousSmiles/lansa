import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';
import {
  generateChatRequestEmail,
  generateChatAcceptedEmail,
  generateNewMessageEmail,
  generateEmployerInterestEmail,
  generateEmployerNudgeEmail,
  generateMatchCreatedEmail,
  generateJobApplicationEmail,
} from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatEmailPayload {
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

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

    const payload: ChatEmailPayload = await req.json();
    const { user_id, notification_type, title, message, action_url, metadata } = payload;

    console.log('[send-chat-email] Processing:', { user_id, notification_type });

    // Get recipient profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile?.email) {
      console.log('[send-chat-email] No email for user, skipping');
      return new Response(
        JSON.stringify({ message: 'User has no email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientName = profile.name || 'there';
    let emailContent: { subject: string; html: string } | null = null;

    // Helper: resolve the other party's name from a thread
    const resolveOtherPartyName = async (threadId: string | null, fallback: string): Promise<string> => {
      if (!threadId) return fallback;
      const { data: thread } = await supabase
        .from('chat_threads')
        .select('participant_ids')
        .eq('id', threadId)
        .single();
      if (!thread?.participant_ids) return fallback;
      const otherUserId = thread.participant_ids.find((id: string) => id !== user_id);
      if (!otherUserId) return fallback;
      const { data: otherProfile } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', otherUserId)
        .single();
      return otherProfile?.name || fallback;
    };

    // Helper: parse thread ID from action_url like /chat/UUID
    const parseThreadId = (url?: string): string | null => {
      if (!url) return null;
      const match = url.match(/\/chat\/([0-9a-f-]{36})/i);
      return match?.[1] ?? null;
    };

    if (notification_type === 'chat_request_received') {
      // Extract requester name from notification message
      const requesterName = await resolveOtherPartyName(parseThreadId(action_url), 'Someone');
      emailContent = generateChatRequestEmail({
        recipientName,
        recipientEmail: profile.email,
        requesterName,
        introNote: message.includes('"') ? message.match(/"([^"]+)"/)?.[1] : undefined,
        actionUrl: action_url || '/notifications',
      });
    } else if (notification_type === 'chat_request_accepted') {
      const threadId = parseThreadId(action_url);
      const otherPartyName = await resolveOtherPartyName(threadId, 'your connection');
      emailContent = generateChatAcceptedEmail({
        recipientName,
        recipientEmail: profile.email,
        otherPartyName,
        threadUrl: action_url || '/chat',
      });
    } else if (notification_type === 'message_received') {
      const threadId = parseThreadId(action_url);
      // Get the most recent sender from chat_messages
      let senderName = 'Someone';
      if (threadId) {
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('sender_id')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (lastMsg?.sender_id) {
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('user_id', lastMsg.sender_id)
            .single();
          senderName = senderProfile?.name || 'Someone';
        }
      }
      emailContent = generateNewMessageEmail({
        recipientName,
        recipientEmail: profile.email,
        senderName,
        messagePreview: message.slice(0, 120),
        threadUrl: action_url || '/chat',
      });
    } else if (notification_type === 'employer_interest_received') {
      // Resolve employer name from metadata.employer_id
      let employerName: string | undefined;
      const employerId = metadata?.employer_id;
      if (employerId) {
        const { data: empProfile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', employerId)
          .single();
        employerName = empProfile?.name || undefined;
      }
      emailContent = generateEmployerInterestEmail({
        recipientName,
        recipientEmail: profile.email,
        dashboardUrl: action_url || '/dashboard',
        employerName,
      });
    } else if (notification_type === 'employer_nudge_received') {
      // Resolve employer name from metadata.employer_id
      let employerName: string | undefined;
      const employerId = metadata?.employer_id;
      if (employerId) {
        const { data: empProfile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', employerId)
          .single();
        employerName = empProfile?.name || undefined;
      }
      emailContent = generateEmployerNudgeEmail({
        recipientName,
        recipientEmail: profile.email,
        dashboardUrl: action_url || '/dashboard',
        employerName,
      });
    } else if (notification_type === 'match_created') {
      // Use metadata.other_user_id directly — avoids race condition with thread creation
      let otherPartyName = 'your match';
      const otherUserId = metadata?.other_user_id;
      if (otherUserId) {
        const { data: otherProfile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', otherUserId)
          .single();
        otherPartyName = otherProfile?.name || otherPartyName;
      } else {
        // Fallback: try thread lookup
        const threadId = parseThreadId(action_url);
        otherPartyName = await resolveOtherPartyName(threadId, 'your match');
      }
      emailContent = generateMatchCreatedEmail({
        recipientName,
        recipientEmail: profile.email,
        otherPartyName,
        threadUrl: action_url || '/chat',
      });
    } else if (notification_type === 'job_application_received') {
      const applicantName = metadata?.applicant_name || 'A candidate';
      const jobId = metadata?.job_id || '';
      // Extract job title from message: `"<title>"`
      const jobTitleMatch = message.match(/"([^"]+)"/);
      const jobTitle = jobTitleMatch?.[1] || 'a job';
      const coverNote = metadata?.cover_note || undefined;
      emailContent = generateJobApplicationEmail({
        recipientName,
        recipientEmail: profile.email,
        applicantName,
        jobTitle,
        coverNote,
        applicantsUrl: action_url
          ? `https://lansa.online${action_url}`
          : `https://lansa.online/dashboard`,
      });
    } else {
      console.log('[send-chat-email] Unknown notification type, skipping');
      return new Response(
        JSON.stringify({ message: 'Not a chat notification type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!emailContent) {
      return new Response(
        JSON.stringify({ message: 'No email template matched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: sendError } = await resend.emails.send({
      from: 'Lansa <noreply@notification.lansa.online>',
      to: [profile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (sendError) {
      console.error('[send-chat-email] Resend error:', sendError);
      return new Response(
        JSON.stringify({ error: sendError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-chat-email] Email sent to ${profile.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[send-chat-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
