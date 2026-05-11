
-- ============================================================
-- Profile Completion Engine
-- ============================================================

-- 1. Tables ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_completion_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text,
  score int NOT NULL DEFAULT 0,
  missing_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_complete boolean GENERATED ALWAYS AS (score >= 85) STORED,
  completed_at timestamptz,
  last_score_at timestamptz NOT NULL DEFAULT now(),
  last_nudge_sent_at timestamptz,
  nudge_sequence_step int NOT NULL DEFAULT 0,
  nudge_paused boolean NOT NULL DEFAULT false,
  nudge_paused_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcs_incomplete ON public.profile_completion_state (is_complete, last_score_at);
CREATE INDEX IF NOT EXISTS idx_pcs_sequence ON public.profile_completion_state (nudge_sequence_step, is_complete);

CREATE TABLE IF NOT EXISTS public.nudge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step int NOT NULL,
  template_key text NOT NULL,
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  resend_message_id text,
  error text,
  UNIQUE (user_id, step)
);

CREATE INDEX IF NOT EXISTS idx_nudge_history_user ON public.nudge_history (user_id, sent_at DESC);

-- 2. RLS ------------------------------------------------------
ALTER TABLE public.profile_completion_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own completion" ON public.profile_completion_state
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all completion" ON public.profile_completion_state
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "users read own nudge history" ON public.nudge_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all nudge history" ON public.nudge_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. Scoring function ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_completion(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p RECORD;
  a RECORD;
  score int := 0;
  missing jsonb := '[]'::jsonb;
  user_type text;
BEGIN
  SELECT * INTO p FROM public.user_profiles WHERE user_id = _user_id;
  SELECT * INTO a FROM public.user_answers WHERE user_id = _user_id;

  user_type := COALESCE(a.user_type::text, 'job_seeker');

  -- onboarding_done (20)
  IF COALESCE(a.career_path_onboarding_completed, false) THEN
    score := score + 20;
  ELSE
    missing := missing || jsonb_build_object('key','onboarding_done','label','Finish onboarding','weight',20,'cta_route','/onboarding');
  END IF;

  -- basic_info (10) — name
  IF p.name IS NOT NULL AND length(p.name) > 0 THEN
    score := score + 10;
  ELSE
    missing := missing || jsonb_build_object('key','basic_info','label','Add your name','weight',10,'cta_route','/profile');
  END IF;

  -- profile_photo (10) — profile_image
  IF p.profile_image IS NOT NULL AND length(p.profile_image) > 0 THEN
    score := score + 10;
  ELSE
    missing := missing || jsonb_build_object('key','profile_photo','label','Upload a profile photo','weight',10,'cta_route','/profile');
  END IF;

  -- about_text (15)
  IF p.about_text IS NOT NULL AND length(p.about_text) >= 40 THEN
    score := score + 15;
  ELSE
    missing := missing || jsonb_build_object('key','about_text','label','Write your About section','weight',15,'cta_route','/profile');
  END IF;

  -- title (5)
  IF p.title IS NOT NULL AND length(p.title) > 0 THEN
    score := score + 5;
  ELSE
    missing := missing || jsonb_build_object('key','title','label','Add a professional title','weight',5,'cta_route','/profile');
  END IF;

  -- experiences (15)
  IF p.experiences IS NOT NULL AND jsonb_typeof(p.experiences) = 'array' AND jsonb_array_length(p.experiences) >= 1 THEN
    score := score + 15;
  ELSE
    missing := missing || jsonb_build_object('key','experiences','label','Add at least one experience','weight',15,'cta_route','/profile');
  END IF;

  -- skills (10) — text[]
  IF p.skills IS NOT NULL AND array_length(p.skills, 1) >= 3 THEN
    score := score + 10;
  ELSE
    missing := missing || jsonb_build_object('key','skills','label','Add 3 or more skills','weight',10,'cta_route','/profile');
  END IF;

  -- education (5)
  IF p.education IS NOT NULL AND jsonb_typeof(p.education) = 'array' AND jsonb_array_length(p.education) >= 1 THEN
    score := score + 5;
  ELSE
    missing := missing || jsonb_build_object('key','education','label','Add your education','weight',5,'cta_route','/profile');
  END IF;

  -- languages (5)
  IF p.languages IS NOT NULL AND jsonb_typeof(p.languages) = 'array' AND jsonb_array_length(p.languages) >= 1 THEN
    score := score + 5;
  ELSE
    missing := missing || jsonb_build_object('key','languages','label','Add a language','weight',5,'cta_route','/profile');
  END IF;

  -- visibility_on (5)
  IF COALESCE(p.visible_to_employers, false) THEN
    score := score + 5;
  ELSE
    missing := missing || jsonb_build_object('key','visibility_on','label','Make your profile visible to employers','weight',5,'cta_route','/profile');
  END IF;

  RETURN jsonb_build_object(
    'score', score,
    'user_type', user_type,
    'missing', missing
  );
END;
$$;

-- 4. Recompute helper ---------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_profile_completion(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_score int;
  v_user_type text;
  v_missing jsonb;
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;
  result := public.get_profile_completion(_user_id);
  v_score := (result->>'score')::int;
  v_user_type := result->>'user_type';
  v_missing := result->'missing';

  INSERT INTO public.profile_completion_state (user_id, user_type, score, missing_steps, last_score_at, updated_at, completed_at)
  VALUES (
    _user_id,
    v_user_type,
    v_score,
    v_missing,
    now(),
    now(),
    CASE WHEN v_score >= 85 THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET user_type = EXCLUDED.user_type,
      score = EXCLUDED.score,
      missing_steps = EXCLUDED.missing_steps,
      last_score_at = now(),
      updated_at = now(),
      completed_at = CASE
        WHEN EXCLUDED.score >= 85 AND public.profile_completion_state.completed_at IS NULL THEN now()
        WHEN EXCLUDED.score < 85 THEN NULL
        ELSE public.profile_completion_state.completed_at
      END;
END;
$$;

-- 5. Triggers -------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_recompute_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_recompute_completion ON public.user_profiles;
CREATE TRIGGER user_profiles_recompute_completion
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_completion();

DROP TRIGGER IF EXISTS user_answers_recompute_completion ON public.user_answers;
CREATE TRIGGER user_answers_recompute_completion
  AFTER INSERT OR UPDATE ON public.user_answers
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_completion();

-- 6. Backfill -------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM auth.users LOOP
    PERFORM public.recompute_profile_completion(r.id);
  END LOOP;
END$$;
