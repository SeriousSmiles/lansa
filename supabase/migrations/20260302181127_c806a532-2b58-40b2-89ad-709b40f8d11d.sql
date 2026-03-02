
-- Part 1: Fix RLS policy on user_certifications
DROP POLICY IF EXISTS "Business users can view verified certifications only" ON public.user_certifications;

CREATE POLICY "Authenticated users can view verified certifications"
ON public.user_certifications
FOR SELECT
TO authenticated
USING (
  (user_id = auth.uid())
  OR (lansa_certified = true AND verified = true)
);

-- Part 2: Add 'employer' to app_role enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'employer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'employer';
  END IF;
END$$;
