
-- 1. Create mentor_type enum
CREATE TYPE public.mentor_type AS ENUM ('teacher', 'coach', 'organization');

-- 2. Create subscription_tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro');

-- 3. Create mentor_profiles table
CREATE TABLE public.mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  mentor_type public.mentor_type NOT NULL DEFAULT 'teacher',
  external_url text,
  profile_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Mentor profiles are publicly readable
CREATE POLICY "Anyone authenticated can view mentor profiles"
  ON public.mentor_profiles FOR SELECT TO authenticated
  USING (true);

-- Mentors can manage their own profile
CREATE POLICY "Mentors can insert their own profile"
  ON public.mentor_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can update their own profile"
  ON public.mentor_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all mentor profiles
CREATE POLICY "Admins can manage all mentor profiles"
  ON public.mentor_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create mentor_subscriptions table
CREATE TABLE public.mentor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  price_xcg numeric NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Mentors can view their own subscription
CREATE POLICY "Mentors can view their own subscription"
  ON public.mentor_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Mentors can insert their own subscription
CREATE POLICY "Mentors can insert their own subscription"
  ON public.mentor_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON public.mentor_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Mentors can view subscription tier (for content library badge display)
CREATE POLICY "Authenticated can view active subscriptions"
  ON public.mentor_subscriptions FOR SELECT TO authenticated
  USING (is_active = true);

-- 5. Extend content_videos table with mentor columns
ALTER TABLE public.content_videos
  ADD COLUMN mentor_id uuid,
  ADD COLUMN external_link text,
  ADD COLUMN is_promoted boolean NOT NULL DEFAULT false;

-- 6. Create check_mentor_video_limit function
CREATE OR REPLACE FUNCTION public.check_mentor_video_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_tier subscription_tier;
  video_count integer;
  max_videos integer;
BEGIN
  -- Get active subscription tier
  SELECT tier INTO current_tier
  FROM public.mentor_subscriptions
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;

  -- Default to free if no subscription
  IF current_tier IS NULL THEN
    current_tier := 'free';
  END IF;

  -- Count existing videos
  SELECT COUNT(*) INTO video_count
  FROM public.content_videos
  WHERE mentor_id = _user_id;

  -- Determine limit
  CASE current_tier
    WHEN 'free' THEN max_videos := 1;
    WHEN 'starter' THEN max_videos := 3;
    WHEN 'pro' THEN max_videos := 999999; -- effectively unlimited
  END CASE;

  RETURN video_count < max_videos;
END;
$$;

-- 7. RLS policies for mentor videos on content_videos
-- Mentors can insert their own videos (within limit)
CREATE POLICY "Mentors can insert their own videos"
  ON public.content_videos FOR INSERT TO authenticated
  WITH CHECK (
    mentor_id = auth.uid()
    AND public.check_mentor_video_limit(auth.uid())
  );

-- Mentors can update their own videos
CREATE POLICY "Mentors can update their own videos"
  ON public.content_videos FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid());

-- Mentors can delete their own videos
CREATE POLICY "Mentors can delete their own videos"
  ON public.content_videos FOR DELETE TO authenticated
  USING (mentor_id = auth.uid());
