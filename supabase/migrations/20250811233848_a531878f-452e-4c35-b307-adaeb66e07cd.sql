-- Create a safe public SELECT policy for shared profiles only (idempotent)
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