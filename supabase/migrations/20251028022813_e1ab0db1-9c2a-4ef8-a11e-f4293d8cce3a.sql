-- Drop the old recursive policies that are still causing issues
-- These were not dropped because the names didn't match exactly
DROP POLICY IF EXISTS "Admins can approve membership requests" ON public.organization_memberships;
DROP POLICY IF EXISTS "Admins can view all memberships in their org" ON public.organization_memberships;
DROP POLICY IF EXISTS "Members can view memberships in their org" ON public.organization_memberships;
DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON public.organization_memberships;

-- Recreate SELECT policy for members
CREATE POLICY "Members can view org memberships"
ON public.organization_memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.check_org_membership(auth.uid(), organization_id, ARRAY['owner', 'admin', 'manager'])
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate UPDATE policy for admins to approve requests
CREATE POLICY "Admins can update memberships"
ON public.organization_memberships
FOR UPDATE
TO authenticated
USING (
  public.check_org_membership(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate INSERT/DELETE policies for owners/admins
CREATE POLICY "Admins can manage memberships"
ON public.organization_memberships
FOR ALL
TO authenticated
USING (
  public.check_org_membership(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  public.check_org_membership(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  OR has_role(auth.uid(), 'admin'::app_role)
);