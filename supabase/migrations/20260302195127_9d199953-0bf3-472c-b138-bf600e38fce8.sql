
-- Step 1: Extend notification_type enum with new values
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'employer_interest_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'employer_nudge_received';

-- Step 2: Add RLS policy on swipes so candidates can see swipes targeting them
CREATE POLICY swipes_select_target
  ON public.swipes
  FOR SELECT
  TO authenticated
  USING (target_user_id = auth.uid());

-- Step 3: Trigger function - notify candidate when employer swipes right or nudge
CREATE OR REPLACE FUNCTION public.notify_candidate_on_employer_swipe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify for right swipes and nudges
  IF NEW.direction = 'right' THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
      NEW.target_user_id,
      'employer_interest_received',
      '💚 An employer is interested!',
      'An employer liked your profile. If you like them back, you''ll match!',
      '/dashboard',
      jsonb_build_object('employer_id', NEW.swiper_user_id, 'context', NEW.context)
    );
  ELSIF NEW.direction = 'nudge' THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
      NEW.target_user_id,
      'employer_nudge_received',
      '⚡ Super Interest received!',
      'An employer sent you super interest — they really want to connect!',
      '/dashboard',
      jsonb_build_object('employer_id', NEW.swiper_user_id, 'context', NEW.context)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists then recreate
DROP TRIGGER IF EXISTS notify_candidate_on_swipe_trigger ON public.swipes;

CREATE TRIGGER notify_candidate_on_swipe_trigger
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_candidate_on_employer_swipe();

-- Step 4: Trigger function - notify both users when a match is created
CREATE OR REPLACE FUNCTION public.notify_both_on_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_thread_id uuid;
  v_user_a_name text;
  v_user_b_name text;
BEGIN
  -- Wait a brief moment for the thread to be created by create_thread_on_match trigger
  -- Query the chat thread linked to this match
  SELECT id INTO v_thread_id
  FROM public.chat_threads
  WHERE match_id = NEW.id
  LIMIT 1;

  -- Get names for personalized messages
  SELECT name INTO v_user_a_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_a;

  SELECT name INTO v_user_b_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_b;

  -- Notify user_a about the match
  INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
  VALUES (
    NEW.user_a,
    'match_created',
    '🎉 It''s a Match!',
    CASE 
      WHEN v_user_b_name IS NOT NULL AND v_user_b_name != ''
      THEN 'You and ' || v_user_b_name || ' matched! Start chatting now.'
      ELSE 'You have a new match! Start chatting now.'
    END,
    CASE WHEN v_thread_id IS NOT NULL THEN '/chat/' || v_thread_id::text ELSE '/chat' END,
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_b, 'thread_id', v_thread_id)
  );

  -- Notify user_b about the match
  INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
  VALUES (
    NEW.user_b,
    'match_created',
    '🎉 It''s a Match!',
    CASE 
      WHEN v_user_a_name IS NOT NULL AND v_user_a_name != ''
      THEN 'You and ' || v_user_a_name || ' matched! Start chatting now.'
      ELSE 'You have a new match! Start chatting now.'
    END,
    CASE WHEN v_thread_id IS NOT NULL THEN '/chat/' || v_thread_id::text ELSE '/chat' END,
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_a, 'thread_id', v_thread_id)
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists then recreate
DROP TRIGGER IF EXISTS notify_both_on_match_trigger ON public.matches;

CREATE TRIGGER notify_both_on_match_trigger
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_both_on_match();

-- Step 5: Update trigger_chat_notification_email to include new types
CREATE OR REPLACE FUNCTION public.trigger_chat_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_url text;
  v_service_key text;
BEGIN
  -- Only trigger for relevant notification types
  IF NEW.type NOT IN (
    'chat_request_received',
    'chat_request_accepted',
    'message_received',
    'employer_interest_received',
    'employer_nudge_received',
    'match_created'
  ) THEN
    RETURN NEW;
  END IF;

  -- Get config
  v_project_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- Call edge function via pg_net
  PERFORM net.http_post(
    url := v_project_url || '/functions/v1/send-chat-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'notification_type', NEW.type,
      'title', NEW.title,
      'message', NEW.message,
      'action_url', NEW.action_url
    )
  );

  RETURN NEW;
END;
$$;
