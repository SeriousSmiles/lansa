ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS current_industry TEXT,
  ADD COLUMN IF NOT EXISTS work_experience_years TEXT,
  ADD COLUMN IF NOT EXISTS career_intention_professional TEXT,
  ADD COLUMN IF NOT EXISTS still_studying BOOLEAN DEFAULT FALSE;