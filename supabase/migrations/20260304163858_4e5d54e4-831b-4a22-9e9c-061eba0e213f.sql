
-- ============================================================
-- FIX 1: business_profiles — allow chat participants to read
-- ============================================================
DROP POLICY IF EXISTS "chat_participants_can_read_business_profile" ON public.business_profiles;

CREATE POLICY "chat_participants_can_read_business_profile"
ON public.business_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE (business_profiles.user_id = ANY(ct.participant_ids))
      AND (auth.uid() = ANY(ct.participant_ids))
  )
);

-- ============================================================
-- FIX 2: organizations — allow chat participants to read org info
-- ============================================================
DROP POLICY IF EXISTS "chat_participants_can_read_org_name" ON public.organizations;

CREATE POLICY "chat_participants_can_read_org_name"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    JOIN public.chat_threads ct ON (om.user_id = ANY(ct.participant_ids))
    WHERE om.organization_id = organizations.id
      AND auth.uid() = ANY(ct.participant_ids)
  )
);

-- ============================================================
-- FIX 3: organization_memberships — allow chat participants to
-- read memberships needed to resolve org names in the view
-- ============================================================
DROP POLICY IF EXISTS "chat_participants_can_read_org_membership" ON public.organization_memberships;

CREATE POLICY "chat_participants_can_read_org_membership"
ON public.organization_memberships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE (organization_memberships.user_id = ANY(ct.participant_ids))
      AND (auth.uid() = ANY(ct.participant_ids))
  )
);

-- ============================================================
-- FIX 4: Remove duplicate public-role INSERT/SELECT policies
-- on chat_messages (authenticated-scoped ones are sufficient)
-- ============================================================
DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;

-- ============================================================
-- FIX 5: Recreate chat_participants_view with security_invoker=false
-- so org joins bypass invoker RLS and resolve correctly for all users
-- ============================================================
DROP VIEW IF EXISTS public.chat_participants_view;

CREATE VIEW public.chat_participants_view
WITH (security_invoker = false)
AS
SELECT
  up.user_id,
  COALESCE(NULLIF(TRIM(up.name), ''), bp.company_name) AS name,
  up.profile_image,
  up.title,
  om.organization_id,
  COALESCE(o.name, bp.company_name) AS organization_name,
  o.logo_url AS organization_logo
FROM user_profiles up
LEFT JOIN organization_memberships om ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN organizations o ON o.id = om.organization_id
LEFT JOIN business_profiles bp ON bp.user_id = up.user_id

UNION

SELECT
  bp.user_id,
  bp.company_name AS name,
  NULL::text AS profile_image,
  bp.company_name AS title,
  NULL::uuid AS organization_id,
  bp.company_name AS organization_name,
  NULL::text AS organization_logo
FROM business_profiles bp
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = bp.user_id
);
