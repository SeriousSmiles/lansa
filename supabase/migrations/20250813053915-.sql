-- Matchmaking backend for Lansa
-- 1) Roles and helpers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','business','student');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role = _role
  );
$$;

-- 2) Enums for matchmaking
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_context') THEN
    CREATE TYPE public.match_context AS ENUM ('employee','internship');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swipe_direction') THEN
    CREATE TYPE public.swipe_direction AS ENUM ('right','left','nudge');
  END IF;
END $$;

-- 3) Business profiles
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  industry text,
  company_size text,
  location text,
  website text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER update_business_profiles_updated_at
BEFORE UPDATE ON public.business_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: owner-only CRUD
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_profiles' AND policyname='business_profiles_insert_own'
  ) THEN
    CREATE POLICY "business_profiles_insert_own"
    ON public.business_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_profiles' AND policyname='business_profiles_select_own'
  ) THEN
    CREATE POLICY "business_profiles_select_own"
    ON public.business_profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_profiles' AND policyname='business_profiles_update_own'
  ) THEN
    CREATE POLICY "business_profiles_update_own"
    ON public.business_profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_profiles' AND policyname='business_profiles_delete_own'
  ) THEN
    CREATE POLICY "business_profiles_delete_own"
    ON public.business_profiles
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- 4) Job listings
CREATE TABLE IF NOT EXISTS public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  mode public.match_context NOT NULL,
  location text,
  top_skills text[] DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER update_job_listings_updated_at
BEFORE UPDATE ON public.job_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: business owners manage their listings; authenticated can view active listings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='job_listings' AND policyname='job_listings_insert_owner'
  ) THEN
    CREATE POLICY "job_listings_insert_owner"
    ON public.job_listings
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.has_role(auth.uid(),'business') AND
      (SELECT user_id FROM public.business_profiles bp WHERE bp.id = business_id) = auth.uid()
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='job_listings' AND policyname='job_listings_update_owner'
  ) THEN
    CREATE POLICY "job_listings_update_owner"
    ON public.job_listings
    FOR UPDATE
    TO authenticated
    USING (
      (SELECT user_id FROM public.business_profiles bp WHERE bp.id = business_id) = auth.uid()
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='job_listings' AND policyname='job_listings_delete_owner'
  ) THEN
    CREATE POLICY "job_listings_delete_owner"
    ON public.job_listings
    FOR DELETE
    TO authenticated
    USING (
      (SELECT user_id FROM public.business_profiles bp WHERE bp.id = business_id) = auth.uid()
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='job_listings' AND policyname='job_listings_select_active_auth'
  ) THEN
    CREATE POLICY "job_listings_select_active_auth"
    ON public.job_listings
    FOR SELECT
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- 5) User certifications
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  lansa_certified boolean NOT NULL DEFAULT false,
  assessment_score integer,
  mini_project_url text,
  certified_at timestamptz,
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER update_user_certifications_updated_at
BEFORE UPDATE ON public.user_certifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: owners can manage their row; admins can update/verify any
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_certifications' AND policyname='user_certifications_insert_own'
  ) THEN
    CREATE POLICY "user_certifications_insert_own"
    ON public.user_certifications
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_certifications' AND policyname='user_certifications_update_own'
  ) THEN
    CREATE POLICY "user_certifications_update_own"
    ON public.user_certifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_certifications' AND policyname='user_certifications_select_own'
  ) THEN
    CREATE POLICY "user_certifications_select_own"
    ON public.user_certifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_certifications' AND policyname='user_certifications_admin_update'
  ) THEN
    CREATE POLICY "user_certifications_admin_update"
    ON public.user_certifications
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(),'admin'));
  END IF;
END $$;

-- 6) Catalogue entries (opt-in to swipe catalogue)
CREATE TABLE IF NOT EXISTS public.catalogue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  job_ready boolean NOT NULL DEFAULT false,
  internship_ready boolean NOT NULL DEFAULT false,
  location text,
  availability text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalogue_entries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER update_catalogue_entries_updated_at
BEFORE UPDATE ON public.catalogue_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: owner manage; business can view active entries
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='catalogue_entries' AND policyname='catalogue_entries_insert_own'
  ) THEN
    CREATE POLICY "catalogue_entries_insert_own"
    ON public.catalogue_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='catalogue_entries' AND policyname='catalogue_entries_update_own'
  ) THEN
    CREATE POLICY "catalogue_entries_update_own"
    ON public.catalogue_entries
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='catalogue_entries' AND policyname='catalogue_entries_select_own'
  ) THEN
    CREATE POLICY "catalogue_entries_select_own"
    ON public.catalogue_entries
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='catalogue_entries' AND policyname='catalogue_entries_select_business_active'
  ) THEN
    CREATE POLICY "catalogue_entries_select_business_active"
    ON public.catalogue_entries
    FOR SELECT
    TO authenticated
    USING (is_active = true AND public.has_role(auth.uid(),'business'));
  END IF;
END $$;

-- 7) Swipes
CREATE TABLE IF NOT EXISTS public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  direction public.swipe_direction NOT NULL,
  context public.match_context NOT NULL,
  job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Unique constraints to prevent duplicate swipes
CREATE UNIQUE INDEX IF NOT EXISTS uniq_swipe_with_listing
  ON public.swipes (swiper_user_id, target_user_id, context, job_listing_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_swipe_without_listing
  ON public.swipes (swiper_user_id, target_user_id, context)
  WHERE job_listing_id IS NULL;

-- Policies: swipers manage their own swipes; targets can see right/nudge swipes aimed at them
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='swipes' AND policyname='swipes_insert_own'
  ) THEN
    CREATE POLICY "swipes_insert_own"
    ON public.swipes
    FOR INSERT
    TO authenticated
    WITH CHECK (swiper_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='swipes' AND policyname='swipes_select_own_or_targeted'
  ) THEN
    CREATE POLICY "swipes_select_own_or_targeted"
    ON public.swipes
    FOR SELECT
    TO authenticated
    USING (
      swiper_user_id = auth.uid() OR
      (target_user_id = auth.uid() AND direction IN ('right','nudge'))
    );
  END IF;
END $$;

-- 8) Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  context public.match_context NOT NULL,
  job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  latest_activity_at timestamptz NOT NULL DEFAULT now(),
  user_low uuid GENERATED ALWAYS AS (LEAST(user_a, user_b)) STORED,
  user_high uuid GENERATED ALWAYS AS (GREATEST(user_a, user_b)) STORED,
  UNIQUE (user_low, user_high, context, job_listing_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policies: only participants can view/update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='matches' AND policyname='matches_select_participants'
  ) THEN
    CREATE POLICY "matches_select_participants"
    ON public.matches
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (user_a, user_b));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='matches' AND policyname='matches_update_participants'
  ) THEN
    CREATE POLICY "matches_update_participants"
    ON public.matches
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (user_a, user_b));
  END IF;
END $$;

-- Trigger to create a match on mutual right swipes
CREATE OR REPLACE FUNCTION public.create_match_if_mutual()
RETURNS trigger
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS on_swipe_create_match ON public.swipes;
CREATE TRIGGER on_swipe_create_match
AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION public.create_match_if_mutual();

-- 9) Chat threads and messages
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  participant_ids uuid[] NOT NULL,
  context public.match_context NOT NULL,
  job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz
);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_thread_participant(_thread_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE ct.id = _thread_id AND _user_id = ANY(ct.participant_ids)
  );
$$;

-- Policies for chat_threads
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_threads' AND policyname='chat_threads_select_participant'
  ) THEN
    CREATE POLICY "chat_threads_select_participant"
    ON public.chat_threads
    FOR SELECT
    TO authenticated
    USING (public.is_thread_participant(id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_threads' AND policyname='chat_threads_insert_participant'
  ) THEN
    CREATE POLICY "chat_threads_insert_participant"
    ON public.chat_threads
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by AND auth.uid() = ANY(participant_ids));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_threads' AND policyname='chat_threads_update_participant'
  ) THEN
    CREATE POLICY "chat_threads_update_participant"
    ON public.chat_threads
    FOR UPDATE
    TO authenticated
    USING (public.is_thread_participant(id, auth.uid()));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_messages' AND policyname='chat_messages_select_participant'
  ) THEN
    CREATE POLICY "chat_messages_select_participant"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (public.is_thread_participant(thread_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_messages' AND policyname='chat_messages_insert_sender'
  ) THEN
    CREATE POLICY "chat_messages_insert_sender"
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      sender_id = auth.uid() AND public.is_thread_participant(thread_id, auth.uid())
    );
  END IF;
END $$;

-- Trigger: when a match is created, ensure a chat thread exists
CREATE OR REPLACE FUNCTION public.create_thread_on_match()
RETURNS trigger
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS on_match_create_thread ON public.matches;
CREATE TRIGGER on_match_create_thread
AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.create_thread_on_match();

-- 10) View for swiping catalogue (business-only via RLS on catalogue_entries)
CREATE OR REPLACE VIEW public.catalogue_students AS
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

-- Granting is controlled via RLS on base tables. No direct grants needed.

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_job_listings_business ON public.job_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_active ON public.catalogue_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user_low, user_high);
