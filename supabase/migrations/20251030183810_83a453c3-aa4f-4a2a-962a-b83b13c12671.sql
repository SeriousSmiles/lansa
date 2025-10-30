-- 0) Create new enums
CREATE TYPE public.user_color AS ENUM ('purple','green','orange','red');
CREATE TYPE public.intent_stage AS ENUM ('upgrade_ready','downgrade_risk','cancel_risk','none');
CREATE TYPE public.wall_type AS ENUM ('certification');
CREATE TYPE public.wall_outcome AS ENUM ('fired','info_opened','paid','dismissed','ignored');

-- 1) Add admin-related columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS color_auto user_color,
  ADD COLUMN IF NOT EXISTS color_admin user_color,
  ADD COLUMN IF NOT EXISTS intent intent_stage DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS certified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certification_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS visible_to_employers boolean DEFAULT false;

-- Simple indexes on color columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_color_admin ON public.user_profiles (color_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_color_auto ON public.user_profiles (color_auto);

-- 2) Pricing wall events
CREATE TABLE IF NOT EXISTS public.pricing_wall_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wall wall_type NOT NULL,
  outcome wall_outcome NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wall_user_time ON public.pricing_wall_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wall_type_time ON public.pricing_wall_events (wall, created_at DESC);

-- 3) Admin notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_notes_user ON public.admin_notes (user_id, created_at DESC);

-- 4) Admin action log (auditing)
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Admin access log
CREATE TABLE IF NOT EXISTS public.admin_access_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Enable RLS on new tables
ALTER TABLE public.pricing_wall_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

-- 7) RLS Policies for admin tables
CREATE POLICY "wall_events_admins_only"
  ON public.pricing_wall_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "wall_events_insert_authenticated"
  ON public.pricing_wall_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_notes_select_admins"
  ON public.admin_notes FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_notes_insert_admins"
  ON public.admin_notes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = author_id);

CREATE POLICY "admin_notes_update_admins"
  ON public.admin_notes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_notes_delete_admins"
  ON public.admin_notes FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_actions_log_admins"
  ON public.admin_actions_log FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_access_log_admins"
  ON public.admin_access_log FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8) Additional RLS policy for admins to view all user profiles
CREATE POLICY "user_profiles_admins_read_all"
  ON public.user_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "user_profiles_admins_update_all"
  ON public.user_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- 9) Trigger: when certification paid, set flags
CREATE OR REPLACE FUNCTION public.mark_certified()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.wall = 'certification' AND NEW.outcome = 'paid') THEN
    UPDATE public.user_profiles
      SET certified = true,
          certification_paid_at = COALESCE(certification_paid_at, now()),
          visible_to_employers = true
      WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wall_paid ON public.pricing_wall_events;
CREATE TRIGGER trg_wall_paid
AFTER INSERT ON public.pricing_wall_events
FOR EACH ROW EXECUTE FUNCTION public.mark_certified();

-- 10) Helper function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_actions_log (admin_id, action, target_user_id, metadata)
  VALUES (auth.uid(), p_action, p_target_user_id, p_metadata);
END;
$$;