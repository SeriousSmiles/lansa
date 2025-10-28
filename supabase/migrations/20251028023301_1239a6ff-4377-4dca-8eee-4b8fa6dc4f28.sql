-- Allow authenticated users to create organizations
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also ensure they can create their own membership when creating an org
-- Update the existing insert policy to allow initial membership creation
DROP POLICY IF EXISTS "Users can request to join organizations" ON public.organization_memberships;

-- Allow users to create memberships for new organizations they create
CREATE POLICY "Users can create memberships"
ON public.organization_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if creating their own membership for a new org (as owner)
  (user_id = auth.uid() AND role = 'owner')
  OR
  -- Allow if requesting to join (as pending member)
  (user_id = auth.uid() AND is_active = false)
);