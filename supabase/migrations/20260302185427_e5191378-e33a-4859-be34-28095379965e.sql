
-- ============================================================
-- PHASE 1: Chat Consent System Foundation
-- ============================================================

-- 1. New notification enum values for chat events
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_accepted';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_declined';

-- 2. Create connection_requests table
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  requester_org_id uuid,
  intro_note text,
  status text NOT NULL DEFAULT 'pending',
  source text NOT NULL DEFAULT 'browse',
  job_listing_id uuid,
  thread_id uuid,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT no_self_request CHECK (requester_id <> recipient_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined')),
  CONSTRAINT valid_source CHECK (source IN ('browse', 'job_application', 'candidate_initiated'))
);

-- Unique constraint: one active request per pair
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_request 
  ON public.connection_requests (requester_id, recipient_id) 
  WHERE status = 'pending';

-- Validate intro note length via trigger (not CHECK constraint - avoids immutability issues)
CREATE OR REPLACE FUNCTION public.validate_intro_note()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.intro_note IS NOT NULL AND char_length(NEW.intro_note) > 200 THEN
    RAISE EXCEPTION 'intro_note cannot exceed 200 characters';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS validate_intro_note_trigger ON public.connection_requests;
CREATE TRIGGER validate_intro_note_trigger
  BEFORE INSERT OR UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_intro_note();

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- RLS: requester or recipient can SELECT
CREATE POLICY "connection_requests_select" ON public.connection_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

-- RLS: authenticated users can INSERT (requester_id must be their own uid)
CREATE POLICY "connection_requests_insert" ON public.connection_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- RLS: only recipient can UPDATE status
CREATE POLICY "connection_requests_update" ON public.connection_requests
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- 3. Alter chat_messages: add employer identity columns
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_display_name text,
  ADD COLUMN IF NOT EXISTS sender_org_id uuid;

-- 4. Alter chat_threads: add consent + org context columns
ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS connection_request_id uuid REFERENCES public.connection_requests(id),
  ADD COLUMN IF NOT EXISTS org_id uuid,
  ADD COLUMN IF NOT EXISTS thread_status text NOT NULL DEFAULT 'active';

-- 5. chat_email_log for rate limiting
CREATE TABLE IF NOT EXISTS public.chat_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid,
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_email_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access email log (internal)
CREATE POLICY "chat_email_log_service_only" ON public.chat_email_log
  FOR ALL USING (false);

-- 6. chat_participants_view: safe cross-user name/org resolution for thread members
CREATE OR REPLACE VIEW public.chat_participants_view AS
SELECT 
  up.user_id,
  up.name,
  up.profile_image,
  up.title,
  om.organization_id,
  o.name AS organization_name,
  o.logo_url AS organization_logo
FROM public.user_profiles up
LEFT JOIN public.organization_memberships om 
  ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id;

-- Grant read access to authenticated users (filtered at app layer by participant_ids)
GRANT SELECT ON public.chat_participants_view TO authenticated;

-- 7. Trigger: auto-create chat thread when connection request is accepted
CREATE OR REPLACE FUNCTION public.on_connection_request_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE 
  v_thread_id uuid;
  v_requester_name text;
  v_recipient_name text;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Create the chat thread
    INSERT INTO public.chat_threads (
      participant_ids, 
      context, 
      connection_request_id, 
      org_id, 
      created_by,
      created_at
    )
    VALUES (
      ARRAY[NEW.requester_id, NEW.recipient_id],
      'employee'::public.match_context,
      NEW.id,
      NEW.requester_org_id,
      NEW.requester_id,
      now()
    ) RETURNING id INTO v_thread_id;
    
    -- Link thread back to the request
    UPDATE public.connection_requests 
    SET thread_id = v_thread_id, responded_at = now()
    WHERE id = NEW.id;
    
    -- Get names for notifications
    SELECT name INTO v_requester_name FROM public.user_profiles WHERE user_id = NEW.requester_id;
    SELECT name INTO v_recipient_name FROM public.user_profiles WHERE user_id = NEW.recipient_id;
    
    -- Notify requester: their request was accepted
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.requester_id, 
      'chat_request_accepted', 
      'Connection accepted! 🎉', 
      COALESCE(v_recipient_name, 'Someone') || ' accepted your connection request. Start chatting now!',
      '/chat/' || v_thread_id
    );
    
    -- Notify recipient: they accepted, chat is open
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.recipient_id, 
      'chat_request_accepted', 
      'Chat is now open', 
      'You connected with ' || COALESCE(v_requester_name, 'someone') || '. Say hello!',
      '/chat/' || v_thread_id
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_connection_request_accepted ON public.connection_requests;
CREATE TRIGGER on_connection_request_accepted
  AFTER UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_connection_request_accepted();

-- 8. Trigger: auto-create connection request + thread when job application is accepted
CREATE OR REPLACE FUNCTION public.on_job_application_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_request_id uuid;
  v_thread_id uuid;
  v_job_title text;
  v_employer_id uuid;
  v_applicant_name text;
BEGIN
  -- Only fire when status changes TO 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
    -- Get job title and employer
    SELECT title, created_by INTO v_job_title, v_employer_id
    FROM public.job_listings_v2
    WHERE id = NEW.job_id;
    
    -- If no employer found, skip (data integrity issue)
    IF v_employer_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Check if a connection already exists between these two
    IF EXISTS (
      SELECT 1 FROM public.connection_requests
      WHERE requester_id = v_employer_id AND recipient_id = NEW.applicant_user_id
      AND status IN ('pending', 'accepted')
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Create a pre-accepted connection request
    INSERT INTO public.connection_requests (
      requester_id, recipient_id, status, source, job_listing_id
    ) VALUES (
      v_employer_id, NEW.applicant_user_id, 'accepted', 'job_application', NEW.job_id
    ) RETURNING id INTO v_request_id;
    
    -- Create chat thread directly
    INSERT INTO public.chat_threads (
      participant_ids, context, connection_request_id, created_by, created_at
    ) VALUES (
      ARRAY[v_employer_id, NEW.applicant_user_id],
      'employee'::public.match_context,
      v_request_id,
      v_employer_id,
      now()
    ) RETURNING id INTO v_thread_id;
    
    -- Link thread to request
    UPDATE public.connection_requests 
    SET thread_id = v_thread_id, responded_at = now()
    WHERE id = v_request_id;
    
    -- Get applicant name
    SELECT name INTO v_applicant_name FROM public.user_profiles WHERE user_id = NEW.applicant_user_id;
    
    -- Notify the candidate
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.applicant_user_id,
      'chat_request_accepted',
      'Application accepted! 🎉',
      'Your application for "' || COALESCE(v_job_title, 'a role') || '" was accepted. Chat is now open!',
      '/chat/' || v_thread_id
    );
    
    -- Notify the employer
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      v_employer_id,
      'chat_request_accepted',
      'Candidate chat opened',
      'A chat with ' || COALESCE(v_applicant_name, 'the applicant') || ' is now open.',
      '/chat/' || v_thread_id
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_job_application_accepted ON public.job_applications_v2;
CREATE TRIGGER on_job_application_accepted
  AFTER UPDATE ON public.job_applications_v2
  FOR EACH ROW EXECUTE FUNCTION public.on_job_application_accepted();

-- 9. Drop any existing INSERT policy on chat_threads (thread creation locked to triggers)
DROP POLICY IF EXISTS "chat_threads_insert" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Allow insert for participants" ON public.chat_threads;

-- Keep existing SELECT/UPDATE policies for participants
-- Ensure SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' AND policyname = 'chat_threads_select'
  ) THEN
    CREATE POLICY "chat_threads_select" ON public.chat_threads
      FOR SELECT USING (public.is_thread_participant(id, auth.uid()));
  END IF;
END; $$;

-- 10. Ensure chat_messages RLS policies are solid
-- SELECT: only thread participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' AND policyname = 'chat_messages_select'
  ) THEN
    CREATE POLICY "chat_messages_select" ON public.chat_messages
      FOR SELECT USING (public.is_thread_participant(thread_id, auth.uid()));
  END IF;
END; $$;

-- INSERT: sender_id must match auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' AND policyname = 'chat_messages_insert'
  ) THEN
    CREATE POLICY "chat_messages_insert" ON public.chat_messages
      FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        public.is_thread_participant(thread_id, auth.uid())
      );
  END IF;
END; $$;

-- 11. Function: notify via edge function for chat emails (called by trigger)
CREATE OR REPLACE FUNCTION public.trigger_chat_notification_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_supabase_url text;
  v_anon_key text;
  v_last_email_sent timestamptz;
BEGIN
  -- Only fire for chat notification types
  IF NEW.type NOT IN ('chat_request_received', 'chat_request_accepted', 'message_received') THEN
    RETURN NEW;
  END IF;

  -- Rate limit: max 1 email per user per notification type per 15 minutes
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
      'action_url', NEW.action_url
    )
  );

  INSERT INTO public.chat_email_log (user_id, email_type)
  VALUES (NEW.user_id, NEW.type::text);

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trigger_chat_email_on_notification ON public.notifications;
CREATE TRIGGER trigger_chat_email_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_notification_email();
