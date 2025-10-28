-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Organization members can view memberships in their organization" ON public.organization_memberships;
DROP POLICY IF EXISTS "Organization owners and admins can manage memberships" ON public.organization_memberships;

-- Create security definer function to check organization role without RLS recursion
CREATE OR REPLACE FUNCTION public.check_org_membership(
  _user_id uuid,
  _organization_id uuid,
  _roles text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_memberships
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND is_active = true
      AND (_roles IS NULL OR role = ANY(_roles))
  )
$$;

-- Recreate SELECT policy without recursion
CREATE POLICY "Members can view memberships in their org"
ON public.organization_memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.check_org_membership(auth.uid(), organization_id, ARRAY['owner', 'admin', 'manager'])
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate ALL policy for owners/admins without recursion
CREATE POLICY "Owners and admins can manage memberships"
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