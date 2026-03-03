-- Allow candidates to read the user_profiles of employers who have swiped on them
CREATE POLICY "swipe_targets_can_read_swiper_profiles"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.swipes
    WHERE swipes.swiper_user_id = user_profiles.user_id
      AND swipes.target_user_id = auth.uid()
      AND swipes.direction IN ('right', 'nudge')
  )
);