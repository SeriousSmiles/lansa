-- ============================================
-- ORGANIZATION MULTI-USER FIX (IDEMPOTENT VERSION)
-- ============================================

-- 1. Add organization_id columns (IF NOT EXISTS handles idempotency)
ALTER TABLE job_listings_v2 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE job_applications_v2 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_listings_v2_organization ON job_listings_v2(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_v2_organization ON job_applications_v2(organization_id);

-- 2. Migrate employers who DON'T have organizations yet
-- Only create organizations for users who don't have one
INSERT INTO organizations (
  name, 
  clerk_org_id, 
  slug,
  industry,
  size_range,
  is_active
)
SELECT DISTINCT ON (bod.user_id)
  COALESCE(bod.company_name, 'Company'),
  'legacy-' || bod.user_id,
  lower(regexp_replace(
    COALESCE(bod.company_name, 'company-' || bod.user_id), 
    '[^a-zA-Z0-9]+', '-', 'g'
  )) || '-' || substr(md5(random()::text), 1, 6),
  COALESCE(bod.business_services, 'Technology'),
  COALESCE(bod.business_size, 'Startup'),
  true
FROM business_onboarding_data bod
WHERE NOT EXISTS (
  SELECT 1 FROM organization_memberships om WHERE om.user_id = bod.user_id AND om.is_active = true
)
ON CONFLICT (clerk_org_id) DO NOTHING;

-- 3. Create memberships for users without organizations
INSERT INTO organization_memberships (
  organization_id,
  user_id,
  role,
  is_active
)
SELECT 
  o.id,
  bod.user_id,
  'owner',
  true
FROM business_onboarding_data bod
INNER JOIN organizations o ON o.clerk_org_id = 'legacy-' || bod.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM organization_memberships om 
  WHERE om.user_id = bod.user_id AND om.is_active = true
)
ON CONFLICT DO NOTHING;

-- 4. Link business_profiles to organizations
UPDATE business_profiles bp
SET organization_id = om.organization_id
FROM organization_memberships om
WHERE bp.user_id = om.user_id
  AND om.is_active = true
  AND bp.organization_id IS NULL;

-- 5. Backfill job_listings_v2.organization_id
UPDATE job_listings_v2 jl
SET organization_id = om.organization_id
FROM organization_memberships om
WHERE jl.created_by = om.user_id
  AND om.is_active = true
  AND jl.organization_id IS NULL;

-- 6. Backfill job_applications_v2.organization_id
UPDATE job_applications_v2 ja
SET organization_id = jl.organization_id
FROM job_listings_v2 jl
WHERE ja.job_id = jl.id
  AND jl.organization_id IS NOT NULL
  AND ja.organization_id IS NULL;

-- 7. Update RLS policies (drop and recreate for idempotency)
DROP POLICY IF EXISTS "org_members_select_org_jobs" ON job_listings_v2;
DROP POLICY IF EXISTS "org_members_insert_org_jobs" ON job_listings_v2;
DROP POLICY IF EXISTS "org_members_update_org_jobs" ON job_listings_v2;
DROP POLICY IF EXISTS "org_members_delete_org_jobs" ON job_listings_v2;
DROP POLICY IF EXISTS "apps_select_org_and_applicant" ON job_applications_v2;

-- Organization members can view org jobs
CREATE POLICY "org_members_select_org_jobs" ON job_listings_v2
  FOR SELECT
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = job_listings_v2.organization_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
    )
  );

-- Organization members can create jobs
CREATE POLICY "org_members_insert_org_jobs" ON job_listings_v2
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = job_listings_v2.organization_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
        AND om.role IN ('owner', 'admin', 'manager')
    )
    AND created_by = auth.uid()
  );

-- Organization members can update org jobs
CREATE POLICY "org_members_update_org_jobs" ON job_listings_v2
  FOR UPDATE
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = job_listings_v2.organization_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

-- Organization admins/owners can delete jobs
CREATE POLICY "org_members_delete_org_jobs" ON job_listings_v2
  FOR DELETE
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = job_listings_v2.organization_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
        AND om.role IN ('owner', 'admin')
    )
  );

-- Applicants and org members can view applications
CREATE POLICY "apps_select_org_and_applicant" ON job_applications_v2
  FOR SELECT
  USING (
    applicant_user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM job_listings_v2 jl
      INNER JOIN organization_memberships om ON om.organization_id = jl.organization_id
      WHERE jl.id = job_applications_v2.job_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
    )
  );