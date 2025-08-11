-- Ensure is_public column exists to control visibility
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON public.user_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Remove overly-permissive public SELECT policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_profiles' 
      AND policyname = 'Anyone can view profiles for shared page'
  ) THEN
    DROP POLICY "Anyone can view profiles for shared page" ON public.user_profiles;
  END IF;
END $$;

-- Add safe public policy (only for rows explicitly marked public)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_profiles' 
      AND policyname = 'Anyone can view public profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view public profiles" ON public.user_profiles FOR SELECT USING (is_public = true)';
  END IF;
END $$;