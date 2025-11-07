-- Create table to track segment change email sends (prevent duplicate emails)
CREATE TABLE IF NOT EXISTS public.segment_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_segment user_color,
  new_segment user_color NOT NULL,
  email_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_segment_transition UNIQUE (user_id, old_segment, new_segment, email_sent_at)
);

-- Enable RLS
ALTER TABLE public.segment_email_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email log
CREATE POLICY "Users can view their own segment email log"
  ON public.segment_email_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert email logs
CREATE POLICY "System can insert segment email log"
  ON public.segment_email_log
  FOR INSERT
  WITH CHECK (true);

-- Create function to trigger segment change email
CREATE OR REPLACE FUNCTION public.trigger_segment_change_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_supabase_url text;
  v_anon_key text;
  v_last_email_sent timestamp with time zone;
BEGIN
  -- Only proceed if color_auto actually changed
  IF OLD.color_auto IS DISTINCT FROM NEW.color_auto THEN
    
    -- Check if we've already sent an email for this transition recently (within 24 hours)
    SELECT MAX(email_sent_at) INTO v_last_email_sent
    FROM public.segment_email_log
    WHERE user_id = NEW.user_id
      AND old_segment IS NOT DISTINCT FROM OLD.color_auto
      AND new_segment = NEW.color_auto
      AND email_sent_at > now() - INTERVAL '24 hours';
    
    -- Only trigger if no recent email was sent for this exact transition
    IF v_last_email_sent IS NULL THEN
      -- Get Supabase connection details
      v_supabase_url := current_setting('app.settings.supabase_url', true);
      v_anon_key := current_setting('app.settings.supabase_anon_key', true);
      
      -- Use default values if not set
      IF v_supabase_url IS NULL THEN
        v_supabase_url := 'https://hrmklkcdxkeyttboosgr.supabase.co';
      END IF;
      
      IF v_anon_key IS NULL THEN
        v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWtsa2NkeGtleXR0Ym9vc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzQyNzQsImV4cCI6MjA2MjU1MDI3NH0.7X1DgS3CD8op6xcqfZhvQkoMhXs_qeKrrRMK1vqoGKs';
      END IF;
      
      -- Call the edge function asynchronously via pg_net
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-segment-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := jsonb_build_object(
          'user_id', NEW.user_id,
          'old_segment', OLD.color_auto,
          'new_segment', NEW.color_auto
        )
      );
      
      -- Log the email send attempt
      INSERT INTO public.segment_email_log (user_id, old_segment, new_segment)
      VALUES (NEW.user_id, OLD.color_auto, NEW.color_auto);
      
      RAISE NOTICE 'Triggered segment change email for user % (% → %)', 
        NEW.user_id, OLD.color_auto, NEW.color_auto;
    ELSE
      RAISE NOTICE 'Skipping segment email - already sent recently for user % (% → %)',
        NEW.user_id, OLD.color_auto, NEW.color_auto;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_profiles color_auto changes
DROP TRIGGER IF EXISTS send_segment_email_on_color_change ON public.user_profiles;
CREATE TRIGGER send_segment_email_on_color_change
  AFTER UPDATE OF color_auto ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_segment_change_email();