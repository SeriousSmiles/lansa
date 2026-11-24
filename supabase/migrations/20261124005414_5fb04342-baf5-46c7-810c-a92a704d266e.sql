CREATE OR REPLACE FUNCTION public.notify_candidate_on_employer_swipe()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.swiper_user_id = NEW.target_user_id
    OR NOT EXISTS (SELECT 1 FROM public.user_answers WHERE user_id = NEW.swiper_user_id AND user_type = 'employer')
    OR NOT EXISTS (SELECT 1 FROM public.user_answers WHERE user_id = NEW.target_user_id AND user_type = 'job_seeker') THEN
    RETURN NEW;
  END IF;
  IF NEW.direction = 'right' THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
    VALUES (NEW.target_user_id, 'employer_interest_received', '💚 An employer is interested!',
      'An employer liked your profile. Review their company and choose whether to connect.', '/dashboard',
      jsonb_build_object('employer_id', NEW.swiper_user_id, 'context', NEW.context));
  ELSIF NEW.direction = 'nudge' THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
    VALUES (NEW.target_user_id, 'employer_nudge_received', '⚡ Super Interest received!',
      'An employer sent you super interest — they really want to connect!', '/dashboard',
      jsonb_build_object('employer_id', NEW.swiper_user_id, 'context', NEW.context));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_both_on_match()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_thread_id uuid;
  v_user_a_name text;
  v_user_b_name text;
BEGIN
  IF NEW.user_a = NEW.user_b THEN RETURN NEW; END IF;
  SELECT id INTO v_thread_id FROM public.chat_threads WHERE match_id = NEW.id LIMIT 1;
  SELECT name INTO v_user_a_name FROM public.user_profiles WHERE user_id = NEW.user_a;
  SELECT name INTO v_user_b_name FROM public.user_profiles WHERE user_id = NEW.user_b;
  INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
  VALUES (NEW.user_a, 'match_created', '🎉 It''s a Match!',
    CASE WHEN v_user_b_name IS NOT NULL AND v_user_b_name != '' THEN 'You and ' || v_user_b_name || ' matched! Start chatting now.' ELSE 'You have a new match! Start chatting now.' END,
    CASE WHEN v_thread_id IS NOT NULL THEN '/chat/' || v_thread_id::text ELSE '/chat' END,
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_b, 'thread_id', v_thread_id));
  INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
  VALUES (NEW.user_b, 'match_created', '🎉 It''s a Match!',
    CASE WHEN v_user_a_name IS NOT NULL AND v_user_a_name != '' THEN 'You and ' || v_user_a_name || ' matched! Start chatting now.' ELSE 'You have a new match! Start chatting now.' END,
    CASE WHEN v_thread_id IS NOT NULL THEN '/chat/' || v_thread_id::text ELSE '/chat' END,
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_a, 'thread_id', v_thread_id));
  RETURN NEW;
END;
$$;