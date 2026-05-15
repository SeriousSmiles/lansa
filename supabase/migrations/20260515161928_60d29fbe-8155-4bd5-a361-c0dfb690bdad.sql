UPDATE public.user_profiles up
SET professional_stage = 'student'
WHERE professional_stage IS NULL
  AND (
    COALESCE(up.still_studying, false) = true
    OR EXISTS (
      SELECT 1 FROM public.user_answers ua
      WHERE ua.user_id = up.user_id
        AND ua.career_path = 'student'
    )
  );

UPDATE public.user_profiles up
SET professional_stage = 'working_professional'
WHERE professional_stage IS NULL
  AND (
    COALESCE(NULLIF(regexp_replace(up.work_experience_years::text, '[^0-9]', '', 'g'), '')::int, 0) >= 1
    OR (up.experiences IS NOT NULL
        AND jsonb_typeof(up.experiences) = 'array'
        AND jsonb_array_length(up.experiences) >= 1)
  );