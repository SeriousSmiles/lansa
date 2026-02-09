
-- Drop the overly permissive policy that allows anon/public to read jobs
DROP POLICY IF EXISTS "org_members_select_org_jobs" ON public.job_listings_v2;

-- Recreate as authenticated-only: org members see their org's jobs, everyone sees non-org jobs
CREATE POLICY "authenticated_select_org_jobs"
ON public.job_listings_v2
FOR SELECT
TO authenticated
USING (
  (organization_id IS NULL)
  OR (EXISTS (
    SELECT 1 FROM organization_memberships om
    WHERE om.organization_id = job_listings_v2.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
  ))
);

-- Also fix recruiters_select_own to be authenticated only (was public)
DROP POLICY IF EXISTS "recruiters_select_own" ON public.job_listings_v2;

CREATE POLICY "recruiters_select_own"
ON public.job_listings_v2
FOR SELECT
TO authenticated
USING (created_by = auth.uid());
