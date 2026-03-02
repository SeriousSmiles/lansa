import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';
import {
  generateChatRequestEmail,
  generateChatAcceptedEmail,
  generateNewMessageEmail,
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
    const { user_id, notification_type, title, message, action_url } = payload;

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

    if (notification_type === 'chat_request_received') {
      // Extract requester name from message or use fallback
      emailContent = generateChatRequestEmail({
        recipientName,
        recipientEmail: profile.email,
        requesterName: title.replace('New connection request', '').trim() || 'Someone',
        introNote: message.includes('"') ? message.match(/"([^"]+)"/)?.[1] : undefined,
        actionUrl: action_url || '/notifications',
      });
    } else if (notification_type === 'chat_request_accepted') {
      emailContent = generateChatAcceptedEmail({
        recipientName,
        recipientEmail: profile.email,
        otherPartyName: 'Your connection',
        threadUrl: action_url || '/chat',
      });
    } else if (notification_type === 'message_received') {
      emailContent = generateNewMessageEmail({
        recipientName,
        recipientEmail: profile.email,
        senderName: 'Someone',
        messagePreview: message.slice(0, 120),
        threadUrl: action_url || '/chat',
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
      from: 'Lansa <noreply@lansa.app>',
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
