-- Allow authenticated users to search for active organizations
-- This enables the "Join Organization" flow while maintaining security
CREATE POLICY "Authenticated users can search active organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (is_active = true);