-- Clean up business_profiles referencing Lansa organizations
DELETE FROM business_profiles 
WHERE organization_id IN (
  SELECT id FROM organizations WHERE name ILIKE '%Lansa%'
);

-- Clean up organization_memberships for Lansa organizations
DELETE FROM organization_memberships 
WHERE organization_id IN (
  SELECT id FROM organizations WHERE name ILIKE '%Lansa%'
);

-- Clean up organization_audit_log for Lansa organizations
DELETE FROM organization_audit_log 
WHERE organization_id IN (
  SELECT id FROM organizations WHERE name ILIKE '%Lansa%'
);

-- Clean up organization_invitations for Lansa organizations
DELETE FROM organization_invitations 
WHERE organization_id IN (
  SELECT id FROM organizations WHERE name ILIKE '%Lansa%'
);

-- Finally, delete all Lansa organizations
DELETE FROM organizations 
WHERE name ILIKE '%Lansa%';