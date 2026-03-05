
-- ================================================================
-- PHASE 1: DB TRIGGERS — Auto-track all high-value user actions
-- ================================================================

-- 1A. Trigger: user_power_skills → power_skill_reframed
CREATE OR REPLACE FUNCTION public.track_power_skill_reframed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.user_id, 'power_skill_reframed', jsonb_build_object(
    'skill_id', NEW.id,
    'original_skill', NEW.original_skill,
    'reframed_skill', NEW.reframed_skill
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_power_skill ON public.user_power_skills;
CREATE TRIGGER trg_track_power_skill
  AFTER INSERT ON public.user_power_skills
  FOR EACH ROW EXECUTE FUNCTION public.track_power_skill_reframed();

-- 1B. Trigger: user_90day_goal → goal_90day_created
CREATE OR REPLACE FUNCTION public.track_90day_goal_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.user_id, 'goal_90day_created', jsonb_build_object(
    'goal_id', NEW.id,
    'clarity_level', NEW.clarity_level
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_90day_goal ON public.user_90day_goal;
CREATE TRIGGER trg_track_90day_goal
  AFTER INSERT ON public.user_90day_goal
  FOR EACH ROW EXECUTE FUNCTION public.track_90day_goal_created();

-- 1C. Trigger: user_growth_progress → growth_prompt_completed
CREATE OR REPLACE FUNCTION public.track_growth_prompt_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed IS DISTINCT FROM true) THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (NEW.user_id, 'growth_prompt_completed', jsonb_build_object(
      'prompt_id', NEW.prompt_id,
      'week_assigned', NEW.week_assigned
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_growth_prompt ON public.user_growth_progress;
CREATE TRIGGER trg_track_growth_prompt
  AFTER INSERT OR UPDATE ON public.user_growth_progress
  FOR EACH ROW EXECUTE FUNCTION public.track_growth_prompt_completed();

-- 1D. Trigger: resume_exports → resume_exported
CREATE OR REPLACE FUNCTION public.track_resume_exported()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.user_id, 'resume_exported', jsonb_build_object(
    'export_id', NEW.id,
    'format', NEW.format,
    'design_id', NEW.design_id
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_resume_export ON public.resume_exports;
CREATE TRIGGER trg_track_resume_export
  AFTER INSERT ON public.resume_exports
  FOR EACH ROW EXECUTE FUNCTION public.track_resume_exported();

-- 1E. Trigger: job_applications_v2 → job_applied
CREATE OR REPLACE FUNCTION public.track_job_applied()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.applicant_user_id, 'job_applied', jsonb_build_object(
    'application_id', NEW.id,
    'job_id', NEW.job_id
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_job_applied ON public.job_applications_v2;
CREATE TRIGGER trg_track_job_applied
  AFTER INSERT ON public.job_applications_v2
  FOR EACH ROW EXECUTE FUNCTION public.track_job_applied();

-- 1F. Trigger: user_profiles → visible_to_employers_enabled
CREATE OR REPLACE FUNCTION public.track_visibility_enabled()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.visible_to_employers = true AND (OLD.visible_to_employers IS DISTINCT FROM true) THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (NEW.user_id, 'visible_to_employers_enabled', jsonb_build_object(
      'certified', NEW.certified
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_visibility ON public.user_profiles;
CREATE TRIGGER trg_track_visibility
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.track_visibility_enabled();

-- 1G. Trigger: ai_mirror_reviews → ai_mirror_used
CREATE OR REPLACE FUNCTION public.track_ai_mirror_used()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.user_id, 'ai_mirror_used', jsonb_build_object(
    'review_id', NEW.id,
    'source', NEW.source,
    'hire_signal_score', NEW.hire_signal_score
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_ai_mirror ON public.ai_mirror_reviews;
CREATE TRIGGER trg_track_ai_mirror
  AFTER INSERT ON public.ai_mirror_reviews
  FOR EACH ROW EXECUTE FUNCTION public.track_ai_mirror_used();

-- 1H. Trigger: cert_sessions → certification_started
CREATE OR REPLACE FUNCTION public.track_certification_started()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'in_progress' THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (NEW.user_id, 'certification_started', jsonb_build_object(
      'session_id', NEW.id,
      'sector', NEW.sector
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_cert_started ON public.cert_sessions;
CREATE TRIGGER trg_track_cert_started
  AFTER INSERT ON public.cert_sessions
  FOR EACH ROW EXECUTE FUNCTION public.track_certification_started();

-- 1I. Trigger: cert_certifications → certification_completed
CREATE OR REPLACE FUNCTION public.track_certification_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (NEW.user_id, 'certification_completed', jsonb_build_object(
    'cert_id', NEW.id,
    'level', NEW.level,
    'sector', NEW.sector
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_cert_completed ON public.cert_certifications;
CREATE TRIGGER trg_track_cert_completed
  AFTER INSERT ON public.cert_certifications
  FOR EACH ROW EXECUTE FUNCTION public.track_certification_completed();

-- 1J. Trigger: job_listings_v2 → job_posted (employer action)
CREATE OR REPLACE FUNCTION public.track_job_posted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (NEW.created_by, 'job_posted', jsonb_build_object(
      'job_id', NEW.id,
      'job_title', NEW.title,
      'category', NEW.category
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_job_posted ON public.job_listings_v2;
CREATE TRIGGER trg_track_job_posted
  AFTER INSERT ON public.job_listings_v2
  FOR EACH ROW EXECUTE FUNCTION public.track_job_posted();

-- 1K. Trigger: job_applications_v2 status changes → employer tracking
CREATE OR REPLACE FUNCTION public.track_application_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_employer_id uuid;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT created_by INTO v_employer_id
  FROM public.job_listings_v2
  WHERE id = NEW.job_id;

  IF v_employer_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'reviewing' THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (v_employer_id, 'application_reviewed', jsonb_build_object(
      'application_id', NEW.id, 'job_id', NEW.job_id, 'applicant_id', NEW.applicant_user_id
    ));
  ELSIF NEW.status = 'accepted' THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (v_employer_id, 'candidate_accepted', jsonb_build_object(
      'application_id', NEW.id, 'job_id', NEW.job_id, 'applicant_id', NEW.applicant_user_id
    ));
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (v_employer_id, 'candidate_rejected', jsonb_build_object(
      'application_id', NEW.id, 'job_id', NEW.job_id, 'applicant_id', NEW.applicant_user_id
    ));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_application_status ON public.job_applications_v2;
CREATE TRIGGER trg_track_application_status
  AFTER UPDATE ON public.job_applications_v2
  FOR EACH ROW EXECUTE FUNCTION public.track_application_status_change();

-- 1L. Trigger: swipes → job_swiped
CREATE OR REPLACE FUNCTION public.track_job_swiped()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.direction = 'right' AND NEW.job_listing_id IS NOT NULL THEN
    INSERT INTO public.user_actions (user_id, action_type, metadata)
    VALUES (NEW.swiper_user_id, 'job_swiped', jsonb_build_object(
      'swipe_id', NEW.id, 'job_id', NEW.job_listing_id, 'context', NEW.context
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_job_swiped ON public.swipes;
CREATE TRIGGER trg_track_job_swiped
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.track_job_swiped();

-- ================================================================
-- Update maybe_update_user_color to cover all new action types
-- ================================================================
CREATE OR REPLACE FUNCTION public.maybe_update_user_color()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.action_type != 'dashboard_visited' THEN
    PERFORM public.assign_user_color(NEW.user_id);
  ELSE
    -- Only recalc on dashboard_visited once per hour
    IF NOT EXISTS (
      SELECT 1 FROM public.user_actions
      WHERE user_id = NEW.user_id
        AND action_type = 'dashboard_visited'
        AND created_at > NOW() - INTERVAL '1 hour'
        AND id != NEW.id
    ) THEN
      PERFORM public.assign_user_color(NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ================================================================
-- PHASE 2: Rebuild assign_user_color — weighted, role-aware scoring
-- ================================================================
CREATE OR REPLACE FUNCTION public.assign_user_color(user_id_param uuid)
RETURNS user_color LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_color user_color;
  v_days_since_active integer;
  v_is_employer boolean;
  v_score integer := 0;
  v_high_value_actions integer;
  v_medium_value_actions integer;
  v_low_value_actions integer;
  v_is_visible boolean;
  v_is_certified boolean;
BEGIN
  SELECT 
    EXTRACT(DAY FROM (NOW() - COALESCE(up.last_active_at, up.created_at)))::integer,
    COALESCE(up.certified, false),
    COALESCE(up.visible_to_employers, false)
  INTO v_days_since_active, v_is_certified, v_is_visible
  FROM public.user_profiles up
  WHERE up.user_id = user_id_param;

  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_id_param AND ur.role IN ('employer', 'business')
  ) INTO v_is_employer;

  IF v_is_employer THEN
    -- EMPLOYER SCORING
    SELECT COUNT(*) INTO v_high_value_actions FROM public.user_actions
    WHERE user_id = user_id_param AND action_type IN ('candidate_accepted')
      AND created_at > NOW() - INTERVAL '30 days';

    SELECT COUNT(*) INTO v_medium_value_actions FROM public.user_actions
    WHERE user_id = user_id_param
      AND action_type IN ('job_posted', 'application_reviewed', 'candidate_rejected')
      AND created_at > NOW() - INTERVAL '30 days';

    SELECT COUNT(*) INTO v_low_value_actions FROM public.user_actions
    WHERE user_id = user_id_param AND action_type IN ('dashboard_visited')
      AND created_at > NOW() - INTERVAL '30 days';

    v_score := (LEAST(v_high_value_actions, 5) * 20)
             + (LEAST(v_medium_value_actions, 10) * 10)
             + (LEAST(v_low_value_actions, 10) * 2);

    IF v_days_since_active > 21 THEN v_score := v_score / 2; END IF;

    IF v_score >= 40 THEN v_color := 'purple';
    ELSIF v_score >= 15 THEN v_color := 'green';
    ELSIF v_score >= 5 THEN v_color := 'orange';
    ELSE v_color := 'red';
    END IF;

  ELSE
    -- SEEKER SCORING
    SELECT COUNT(*) INTO v_high_value_actions FROM public.user_actions
    WHERE user_id = user_id_param
      AND action_type IN ('job_applied', 'resume_exported', 'profile_shared', 'pitch_generated')
      AND created_at > NOW() - INTERVAL '60 days';

    SELECT COUNT(*) INTO v_medium_value_actions FROM public.user_actions
    WHERE user_id = user_id_param
      AND action_type IN (
        'power_skill_reframed', 'ai_mirror_used', 'goal_90day_created',
        'growth_prompt_completed', 'certification_completed', 'story_created',
        'certification_started', 'visible_to_employers_enabled'
      )
      AND created_at > NOW() - INTERVAL '60 days';

    SELECT COUNT(*) INTO v_low_value_actions FROM public.user_actions
    WHERE user_id = user_id_param
      AND action_type IN (
        'dashboard_visited', 'insight_opened', 'onboarding_completed',
        'recommended_action_clicked', 'job_swiped', 'profile_updated'
      )
      AND created_at > NOW() - INTERVAL '60 days';

    v_score := (LEAST(v_high_value_actions, 6) * 25)
             + (LEAST(v_medium_value_actions, 10) * 15)
             + (LEAST(v_low_value_actions, 15) * 3);

    IF v_is_certified AND v_is_visible THEN v_score := v_score + 20; END IF;
    IF v_days_since_active > 21 THEN v_score := v_score / 2; END IF;

    IF v_score >= 80 THEN v_color := 'purple';
    ELSIF v_score >= 30 THEN v_color := 'green';
    ELSIF v_score >= 8 THEN v_color := 'orange';
    ELSE v_color := 'red';
    END IF;
  END IF;

  UPDATE public.user_profiles SET color_auto = v_color WHERE user_id = user_id_param;
  RETURN v_color;
END;
$$;

-- ================================================================
-- PHASE 2B: Backfill historical data into user_actions
-- ================================================================

-- Backfill last_active_at from all source tables
UPDATE public.user_profiles up
SET last_active_at = latest.ts
FROM (
  SELECT user_id, MAX(ts) AS ts FROM (
    SELECT user_id, created_at AS ts FROM public.user_actions
    UNION ALL
    SELECT user_id, created_at FROM public.user_power_skills
    UNION ALL
    SELECT user_id, created_at FROM public.user_90day_goal
    UNION ALL
    SELECT user_id, completed_at FROM public.user_growth_progress WHERE is_completed = true AND completed_at IS NOT NULL
    UNION ALL
    SELECT user_id, created_at FROM public.ai_mirror_reviews
    UNION ALL
    SELECT user_id, created_at FROM public.resume_exports
    UNION ALL
    SELECT applicant_user_id AS user_id, created_at FROM public.job_applications_v2
    UNION ALL
    SELECT swiper_user_id AS user_id, created_at FROM public.swipes
  ) all_events
  GROUP BY user_id
) latest
WHERE up.user_id = latest.user_id
  AND (up.last_active_at IS NULL OR latest.ts > up.last_active_at);

-- Backfill power_skill_reframed
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT ups.user_id, 'power_skill_reframed',
  jsonb_build_object('skill_id', ups.id, 'original_skill', ups.original_skill, 'backfilled', true),
  ups.created_at
FROM public.user_power_skills ups
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_actions ua
  WHERE ua.user_id = ups.user_id AND ua.action_type = 'power_skill_reframed'
    AND (ua.metadata->>'skill_id') = ups.id::text
);

-- Backfill goal_90day_created
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT g.user_id, 'goal_90day_created',
  jsonb_build_object('goal_id', g.id, 'backfilled', true),
  g.created_at
FROM public.user_90day_goal g
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_actions ua
  WHERE ua.user_id = g.user_id AND ua.action_type = 'goal_90day_created'
    AND (ua.metadata->>'goal_id') = g.id::text
);

-- Backfill ai_mirror_used
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT amr.user_id, 'ai_mirror_used',
  jsonb_build_object('review_id', amr.id, 'source', amr.source, 'backfilled', true),
  amr.created_at
FROM public.ai_mirror_reviews amr
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_actions ua
  WHERE ua.user_id = amr.user_id AND ua.action_type = 'ai_mirror_used'
    AND (ua.metadata->>'review_id') = amr.id::text
);

-- Backfill job_applied
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT ja.applicant_user_id, 'job_applied',
  jsonb_build_object('application_id', ja.id, 'job_id', ja.job_id, 'backfilled', true),
  ja.created_at
FROM public.job_applications_v2 ja
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_actions ua
  WHERE ua.user_id = ja.applicant_user_id AND ua.action_type = 'job_applied'
    AND (ua.metadata->>'application_id') = ja.id::text
);

-- Backfill certification_completed
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT cc.user_id, 'certification_completed',
  jsonb_build_object('cert_id', cc.id, 'sector', cc.sector, 'level', cc.level, 'backfilled', true),
  cc.created_at
FROM public.cert_certifications cc
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_actions ua
  WHERE ua.user_id = cc.user_id AND ua.action_type = 'certification_completed'
);

-- Backfill visible_to_employers_enabled
INSERT INTO public.user_actions (user_id, action_type, metadata, created_at)
SELECT up.user_id, 'visible_to_employers_enabled',
  jsonb_build_object('backfilled', true, 'certified', up.certified),
  COALESCE(up.certification_paid_at, up.created_at)
FROM public.user_profiles up
WHERE up.visible_to_employers = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_actions ua
    WHERE ua.user_id = up.user_id AND ua.action_type = 'visible_to_employers_enabled'
  );

-- Recompute all colors with the new scoring engine
SELECT public.update_all_user_colors();
