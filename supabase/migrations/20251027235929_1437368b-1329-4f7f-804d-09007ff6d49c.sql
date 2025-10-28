-- ============================================================================
-- PHASE 1: Database Schema Completion & Migration (CORRECTED)
-- ============================================================================

-- ============================================================================
-- PHASE 1.1: Create organization_invitations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT unique_org_email_pending UNIQUE(organization_id, email, status)
);

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can view invitations"
ON public.organization_invitations
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), organization_id, 'admin') OR
  has_org_role(auth.uid(), organization_id, 'owner')
);

CREATE POLICY "Organization admins can create invitations"
ON public.organization_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  (has_org_role(auth.uid(), organization_id, 'admin') OR
   has_org_role(auth.uid(), organization_id, 'owner')) AND
  invited_by = auth.uid()
);

CREATE POLICY "Organization admins can update invitations"
ON public.organization_invitations
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), organization_id, 'admin') OR
  has_org_role(auth.uid(), organization_id, 'owner')
);

CREATE POLICY "Users can view their own invitations"
ON public.organization_invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_org_status ON public.organization_invitations(organization_id, status);

-- ============================================================================
-- PHASE 1.2: Add verification fields to organizations
-- ============================================================================

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS seat_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_organizations_domain ON public.organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_verification_status ON public.organizations(verification_status);

-- ============================================================================
-- PHASE 1.3: Data Migration - Migrate existing employers to organizations
-- ============================================================================

-- Step 1: Create organizations for each existing employer user
INSERT INTO public.organizations (
  id, 
  name, 
  clerk_org_id, 
  slug, 
  industry, 
  size_range, 
  logo_url,
  description,
  is_active,
  created_at, 
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  COALESCE(bod.company_name, bp.company_name, 'Company ' || u.user_id::text) as name,
  'legacy-' || u.user_id::text as clerk_org_id,
  lower(regexp_replace(
    COALESCE(bod.company_name, bp.company_name, 'company-' || u.user_id::text), 
    '[^a-zA-Z0-9]', '-', 'g'
  )) as slug,
  bp.industry,
  COALESCE(bod.business_size, bp.company_size) as size_range,
  bod.company_logo as logo_url,
  bp.description,
  true as is_active,
  COALESCE(bod.created_at, bp.created_at, u.created_at) as created_at,
  now() as updated_at
FROM public.user_answers u
LEFT JOIN public.business_onboarding_data bod ON bod.user_id = u.user_id
LEFT JOIN public.business_profiles bp ON bp.user_id = u.user_id
WHERE u.user_type = 'employer'
  AND NOT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE clerk_org_id = 'legacy-' || u.user_id::text
  )
ON CONFLICT (clerk_org_id) DO NOTHING;

-- Step 2: Create organization_memberships for these users as 'owner'
INSERT INTO public.organization_memberships (
  id,
  organization_id, 
  user_id, 
  role, 
  is_active, 
  joined_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  o.id,
  u.user_id,
  'owner' as role,
  true as is_active,
  COALESCE(u.created_at, now()) as joined_at,
  now() as created_at,
  now() as updated_at
FROM public.user_answers u
INNER JOIN public.organizations o ON o.clerk_org_id = 'legacy-' || u.user_id::text
WHERE u.user_type = 'employer'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = o.id AND user_id = u.user_id
  )
ON CONFLICT DO NOTHING;

-- Step 3: Update business_profiles to reference organization_id (CORRECTED)
UPDATE public.business_profiles
SET organization_id = subquery.org_id
FROM (
  SELECT 
    bp_inner.id as bp_id,
    o.id as org_id
  FROM public.business_profiles bp_inner
  INNER JOIN public.user_answers u ON u.user_id = bp_inner.user_id
  INNER JOIN public.organizations o ON o.clerk_org_id = 'legacy-' || u.user_id::text
  WHERE u.user_type = 'employer'
    AND bp_inner.organization_id IS NULL
) AS subquery
WHERE business_profiles.id = subquery.bp_id;

-- Step 4: Update job_listings to reference organization_id (CORRECTED)
UPDATE public.job_listings
SET organization_id = subquery.org_id
FROM (
  SELECT 
    jl_inner.id as jl_id,
    bp.organization_id as org_id
  FROM public.job_listings jl_inner
  INNER JOIN public.business_profiles bp ON jl_inner.business_id = bp.id
  WHERE jl_inner.organization_id IS NULL
    AND bp.organization_id IS NOT NULL
) AS subquery
WHERE job_listings.id = subquery.jl_id;

-- ============================================================================
-- PHASE 1.4: Enhanced RLS Policies for Organization-scoped access
-- ============================================================================

DROP POLICY IF EXISTS "Users can view pending requests for their orgs" ON public.organization_memberships;
CREATE POLICY "Admins can view all memberships in their org"
ON public.organization_memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  has_org_role(auth.uid(), organization_id, 'admin') OR
  has_org_role(auth.uid(), organization_id, 'owner')
);

DROP POLICY IF EXISTS "Users can request to join organizations" ON public.organization_memberships;
CREATE POLICY "Users can request to join organizations"
ON public.organization_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  is_active = false
);

DROP POLICY IF EXISTS "Admins can approve membership requests" ON public.organization_memberships;
CREATE POLICY "Admins can approve membership requests"
ON public.organization_memberships
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), organization_id, 'admin') OR
  has_org_role(auth.uid(), organization_id, 'owner')
);

-- Create audit log for organization membership changes
CREATE TABLE IF NOT EXISTS public.organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view audit logs"
ON public.organization_audit_log
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), organization_id, 'admin') OR
  has_org_role(auth.uid(), organization_id, 'owner')
);

CREATE POLICY "System can insert audit logs"
ON public.organization_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_org_audit_log_org ON public.organization_audit_log(organization_id, created_at DESC);

-- Create helper function to log organization actions
CREATE OR REPLACE FUNCTION public.log_org_action(
  _org_id UUID,
  _user_id UUID,
  _action TEXT,
  _performed_by UUID,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.organization_audit_log (
    organization_id,
    user_id,
    action,
    performed_by,
    metadata
  ) VALUES (
    _org_id,
    _user_id,
    _action,
    _performed_by,
    _metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;