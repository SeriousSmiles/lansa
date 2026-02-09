
-- Drop the old CHECK constraint on user_answers.user_type
ALTER TABLE public.user_answers DROP CONSTRAINT IF EXISTS user_answers_user_type_check;

-- Re-create it with 'mentor' included
ALTER TABLE public.user_answers ADD CONSTRAINT user_answers_user_type_check
  CHECK (user_type IS NULL OR user_type IN ('job_seeker', 'employer', 'mentor'));

-- Repair the stuck mentor user: insert missing user_answers row
INSERT INTO public.user_answers (user_id, user_type, career_path_onboarding_completed)
VALUES ('450c2e39-fd9e-42f2-8ec8-14c2d565aff9', 'mentor', true)
ON CONFLICT (user_id) DO UPDATE SET
  user_type = 'mentor',
  career_path_onboarding_completed = true,
  updated_at = now();
