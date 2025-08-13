-- Fix security linter items and tighten policies

-- 1) Set explicit search_path on our functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_thread_participant(_thread_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE ct.id = _thread_id AND _user_id = ANY(ct.participant_ids)
  );
$$;

CREATE OR REPLACE FUNCTION public.create_match_if_mutual()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.direction <> 'right' THEN
    RETURN NEW;
  END IF;

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

CREATE OR REPLACE FUNCTION public.create_thread_on_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  participants uuid[];
  existing_thread_id uuid;
BEGIN
  participants := ARRAY[NEW.user_a, NEW.user_b];
  SELECT id INTO existing_thread_id FROM public.chat_threads WHERE match_id = NEW.id;
  IF existing_thread_id IS NULL THEN
    INSERT INTO public.chat_threads (match_id, participant_ids, context, job_listing_id, created_by, created_at)
    VALUES (NEW.id, participants, NEW.context, NEW.job_listing_id, NEW.user_a, now());
  END IF;
  RETURN NEW;
END;
$$;

-- Also set explicit search_path on utility timestamp functions to satisfy linter
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_growth_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2) RLS policies for user_roles (RLS already enabled)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_select_self_or_admin'
  ) THEN
    CREATE POLICY "user_roles_select_self_or_admin"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_admin_insert'
  ) THEN
    CREATE POLICY "user_roles_admin_insert"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(),'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_admin_update'
  ) THEN
    CREATE POLICY "user_roles_admin_update"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(),'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_admin_delete'
  ) THEN
    CREATE POLICY "user_roles_admin_delete"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(),'admin'));
  END IF;
END $$;

-- 3) Allow match creation via user action (trigger) by requiring participant constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='matches' AND policyname='matches_insert_participants'
  ) THEN
    CREATE POLICY "matches_insert_participants"
    ON public.matches
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (user_a, user_b));
  END IF;
END $$;

-- 4) Make catalogue view use invoker security and permit certified visibility
DROP VIEW IF EXISTS public.catalogue_students;
CREATE VIEW public.catalogue_students
WITH (security_invoker = true)
AS
SELECT
  ce.user_id,
  up.name,
  up.title,
  up.about_text,
  up.skills,
  up.profile_image,
  up.cover_color,
  up.highlight_color,
  up.professional_goal,
  ce.job_ready,
  ce.internship_ready,
  ce.location,
  uc.lansa_certified,
  uc.certified_at
FROM public.catalogue_entries ce
JOIN public.user_profiles_public up ON up.user_id = ce.user_id
JOIN public.user_certifications uc ON uc.user_id = ce.user_id AND uc.lansa_certified = true
WHERE ce.is_active = true;

-- Permit businesses to see certification status for catalogue users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_certifications' AND policyname='user_certifications_select_business_certified'
  ) THEN
    CREATE POLICY "user_certifications_select_business_certified"
    ON public.user_certifications
    FOR SELECT
    TO authenticated
    USING (lansa_certified = true AND public.has_role(auth.uid(),'business'));
  END IF;
END $$;
