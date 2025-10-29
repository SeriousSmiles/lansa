-- Step 1: Clean up orphaned organization_memberships records
DELETE FROM organization_memberships
WHERE user_id NOT IN (SELECT user_id FROM user_profiles);

-- Step 2: Add foreign key constraint between organization_memberships and user_profiles
ALTER TABLE organization_memberships 
ADD CONSTRAINT fk_organization_memberships_user_profiles 
FOREIGN KEY (user_id) 
REFERENCES user_profiles(user_id) 
ON DELETE CASCADE;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id 
ON organization_memberships(user_id);

-- Step 4: Add RLS policy allowing org admins to view pending member profiles
CREATE POLICY "Organization admins can view pending member profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM organization_memberships om
    WHERE om.user_id = user_profiles.user_id
      AND om.organization_id IN (
        SELECT organization_id 
        FROM organization_memberships 
        WHERE user_id = auth.uid() 
          AND is_active = true
          AND role IN ('owner', 'admin')
      )
  )
);