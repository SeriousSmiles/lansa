CREATE OR REPLACE FUNCTION public.trigger_chat_notification_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_supabase_url text;
  v_anon_key text;
  v_last_email_sent timestamptz;
BEGIN
  IF NEW.type NOT IN (
    'chat_request_received',
    'chat_request_accepted',
    'message_received',
    'employer_interest_received',
    'employer_nudge_received',
    'match_created',
    'job_application_received'
  ) THEN
    RETURN NEW;
  END IF;

  SELECT MAX(sent_at) INTO v_last_email_sent
  FROM public.chat_email_log
  WHERE user_id = NEW.user_id
    AND email_type = NEW.type::text
    AND sent_at > now() - INTERVAL '15 minutes';

  IF v_last_email_sent IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_supabase_url := 'https://hrmklkcdxkeyttboosgr.supabase.co';
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWtsa2NkeGtleXR0Ym9vc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzQyNzQsImV4cCI6MjA2MjU1MDI3NH0.7X1DgS3CD8op6xcqfZhvQkoMhXs_qeKrrRMK1vqoGKs';

  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-chat-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'notification_type', NEW.type,
      'title', NEW.title,
      'message', NEW.message,
      'action_url', NEW.action_url,
      'metadata', COALESCE(NEW.metadata, '{}'::jsonb)
    )
  );

  INSERT INTO public.chat_email_log (user_id, email_type)
  VALUES (NEW.user_id, NEW.type::text);

  RETURN NEW;
END;
$function$