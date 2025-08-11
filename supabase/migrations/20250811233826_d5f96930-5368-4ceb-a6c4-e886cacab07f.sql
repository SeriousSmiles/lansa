-- Add is_public flag to control public visibility of profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Improve performance for public profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON public.user_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Remove overly-permissive public SELECT policy
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

-- Create a safe public SELECT policy for shared profiles only
CREATE POLICY IF NOT EXISTS "Anyone can view public profiles"
ON public.user_profiles
FOR SELECT
USING (is_public = true);

-- Ensure existing self-access policies remain (no-op if they already exist)
-- Note: We do not modify INSERT/UPDATE/DELETE policies for owners which already exist
