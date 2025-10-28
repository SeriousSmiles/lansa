-- Fix RLS policy for organizations SELECT
-- The existing policy has a bug: it compares om.organization_id = om.id instead of organizations.id

DROP POLICY IF EXISTS "Organization members can view their organizations" ON public.organizations;

CREATE POLICY "Organization members can view their organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = organizations.id
    AND om.user_id = auth.uid()
    AND om.is_active = true
  )
  OR has_role(auth.uid(), 'admin')
);

-- Also fix the UPDATE policy which has the same issue
DROP POLICY IF EXISTS "Organization owners and admins can update their organizations" ON public.organizations;

CREATE POLICY "Organization owners and admins can update their organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = organizations.id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  )
  OR has_role(auth.uid(), 'admin')
);