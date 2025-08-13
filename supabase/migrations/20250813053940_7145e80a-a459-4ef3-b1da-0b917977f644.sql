
-- 1) User roles (student | business | admin) to gate access
CREATE TABLE public.user_roles (
  user_id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('student','business','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER user_roles_set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2) Business profile
CREATE TABLE public.business_profiles (
  user_id uuid PRIMARY KEY,
  company_name text NOT NULL,
  industry text,
  company_size text,
  location text,
  website text,
  about text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business can read own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Business can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER business_profiles_set_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3) Job listings (owned by a business)
CREATE TABLE public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  mode text NOT NULL CHECK (mode IN ('employee','internship')),
  location text,
  skills text[] DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business can read own listings"
  ON public.job_listings FOR SELECT
  USING (auth.uid() = business_user_id);

CREATE POLICY "Business can insert own listings"
  ON public.job_listings FOR INSERT
  WITH CHECK (auth.uid() = business_user_id);

CREATE POLICY "Business can update own listings"
  ON public.job_listings FOR UPDATE
  USING (auth.uid() = business_user_id);

CREATE TRIGGER job_listings_set_updated_at
  BEFORE UPDATE ON public.job_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX job_listings_active_idx ON public.job_listings (is_active);
CREATE INDEX job_listings_mode_idx ON public.job_listings (mode);


-- 4) Certification status (owned by student)
CREATE TABLE public.user_certifications (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','passed','failed')),
  assessment_score integer,
  projects_completed integer NOT NULL DEFAULT 0,
  certified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own certification"
  ON public.user_certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certification"
  ON public.user_certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certification"
  ON public.user_certifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER user_certifications_set_updated_at
  BEFORE UPDATE ON public.user_certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 5) Catalogue entries (controls opt-in and modes)
CREATE TABLE public.catalogue_entries (
  user_id uuid PRIMARY KEY,
  is_opted_in boolean NOT NULL DEFAULT false,
  -- modes a student is visible in; limited to internship or employee
  modes text[] NOT NULL DEFAULT '{}'::text[],
  -- store a concise public pitch and optional video URL
  value_pitch text,
  video_intro_url text,
  -- denormalized flag to avoid joining certification table under RLS
  is_certified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT modes_allowed CHECK (
    NOT EXISTS (
      SELECT 1 FROM unnest(modes) m
      WHERE m NOT IN ('internship','employee')
    )
  )
);
ALTER TABLE public.catalogue_entries ENABLE ROW LEVEL SECURITY;

-- Students manage their own entry
CREATE POLICY "Users can read their own catalogue entry"
  ON public.catalogue_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catalogue entry"
  ON public.catalogue_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogue entry"
  ON public.catalogue_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Businesses can read the catalogue across all users (only opted-in + certified)
CREATE POLICY "Businesses can read the catalogue"
  ON public.catalogue_entries FOR SELECT
  USING (
    is_opted_in = true
    AND is_certified = true
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'business'
    )
  );

CREATE TRIGGER catalogue_entries_set_updated_at
  BEFORE UPDATE ON public.catalogue_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX catalogue_entries_active_idx ON public.catalogue_entries (is_opted_in, is_certified);


-- 6) View combining safe public profile fields with catalogue flags
-- NOTE: user_profiles_public already excludes email/phone/etc.
CREATE OR REPLACE VIEW public.catalogue_students AS
SELECT
  ce.user_id,
  upp.name,
  upp.title,
  COALESCE(upp.skills, '{}'::text[]) AS skills,
  ce.modes,
  ce.value_pitch,
  ce.video_intro_url,
  ce.created_at
FROM public.catalogue_entries ce
JOIN public.user_profiles_public upp ON upp.user_id = ce.user_id
WHERE ce.is_opted_in = true AND ce.is_certified = true;


-- 7) Swipes (right/left/nudge)
CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  mode text NOT NULL CHECK (mode IN ('internship','employee')),
  action text NOT NULL CHECK (action IN ('right','left','nudge')),
  listing_id uuid, -- optional context if swiping in context of a listing
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Only the actor can create a swipe
CREATE POLICY "Users can insert their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = actor_user_id);

-- Actor can see their own swipes
CREATE POLICY "Users can read their own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = actor_user_id);

-- Targets can see swipes about them (for opportunities)
CREATE POLICY "Users can read swipes where they are target"
  ON public.swipes FOR SELECT
  USING (auth.uid() = target_user_id);

CREATE INDEX swipes_actor_idx ON public.swipes (actor_user_id, created_at DESC);
CREATE INDEX swipes_target_idx ON public.swipes (target_user_id, created_at DESC);
CREATE INDEX swipes_action_idx ON public.swipes (action);


-- 8) Matches (mutual right)
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  business_user_id uuid NOT NULL,
  listing_id uuid,
  mode text NOT NULL CHECK (mode IN ('internship','employee')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  nudge_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Only participants can insert (app will ensure mutual right before calling)
CREATE POLICY "Participants can insert match"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = student_id OR auth.uid() = business_user_id);

-- Only participants can view matches
CREATE POLICY "Participants can read match"
  ON public.matches FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = business_user_id);

-- Only participants can update status (archive) or increment nudges
CREATE POLICY "Participants can update match"
  ON public.matches FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = business_user_id);

-- prevent duplicate matches per context
CREATE UNIQUE INDEX matches_unique_employee
  ON public.matches (student_id, business_user_id)
  WHERE listing_id IS NULL;

CREATE UNIQUE INDEX matches_unique_per_listing
  ON public.matches (student_id, business_user_id, listing_id)
  WHERE listing_id IS NOT NULL;


-- 9) Chat threads/messages (1:1 between a matched student and business)
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  student_id uuid NOT NULL,
  business_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read thread"
  ON public.chat_threads FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = business_user_id);

CREATE POLICY "Participants can insert thread"
  ON public.chat_threads FOR INSERT
  WITH CHECK (auth.uid() = student_id OR auth.uid() = business_user_id);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Only thread participants can read and write messages
CREATE POLICY "Participants can read messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = chat_messages.thread_id
        AND (t.student_id = auth.uid() OR t.business_user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = chat_messages.thread_id
        AND (t.student_id = auth.uid() OR t.business_user_id = auth.uid())
        AND sender_id = auth.uid()
    )
  );

-- Helpful indexes
CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);


-- Notes:
-- - We intentionally DO NOT expose email/phone in catalogue_students.
-- - Businesses only see students who are both opted-in and certified.
-- - Students can see swipes targeting them, enabling "Opportunities".
-- - Chat is visible only to thread participants.
