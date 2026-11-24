CREATE OR REPLACE FUNCTION public.create_match_if_mutual()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.direction <> 'right' OR NEW.swiper_user_id = NEW.target_user_id THEN RETURN NEW; END IF;
  IF EXISTS (
    SELECT 1 FROM public.swipes s
    WHERE s.swiper_user_id = NEW.target_user_id
      AND s.target_user_id = NEW.swiper_user_id
      AND s.direction = 'right'
      AND s.context = NEW.context
      AND (s.job_listing_id IS NOT DISTINCT FROM NEW.job_listing_id)
  ) THEN
    INSERT INTO public.matches (user_a, user_b, context, job_listing_id)
    VALUES (NEW.swiper_user_id, NEW.target_user_id, NEW.context, NEW.job_listing_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;