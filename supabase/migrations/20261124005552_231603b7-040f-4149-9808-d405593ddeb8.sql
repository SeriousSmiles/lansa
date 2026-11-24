CREATE OR REPLACE FUNCTION public.get_received_employer_interest()
RETURNS TABLE (id uuid, direction public.swipe_direction, created_at timestamptz, swiper_user_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.direction, s.created_at, s.swiper_user_id
  FROM public.swipes s
  WHERE s.target_user_id = auth.uid()
    AND s.swiper_user_id <> auth.uid()
    AND s.direction IN ('right', 'nudge')
    AND EXISTS (SELECT 1 FROM public.user_answers a WHERE a.user_id = auth.uid() AND a.user_type = 'job_seeker')
    AND EXISTS (SELECT 1 FROM public.user_answers a WHERE a.user_id = s.swiper_user_id AND a.user_type = 'employer')
  ORDER BY s.created_at DESC LIMIT 10;
$$;
REVOKE ALL ON FUNCTION public.get_received_employer_interest() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_received_employer_interest() TO authenticated, service_role;