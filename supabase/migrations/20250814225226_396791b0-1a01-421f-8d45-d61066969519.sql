-- Fix job posting issues by updating RLS policies and ensuring proper user setup

-- First, let's make sure the user has the business role
INSERT INTO user_roles (user_id, role) 
SELECT '48a87477-776a-4a77-a7da-1d818fef6548', 'business'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '48a87477-776a-4a77-a7da-1d818fef6548' 
  AND role = 'business'::app_role
);

-- Create a business profile if it doesn't exist
INSERT INTO business_profiles (user_id, company_name, industry, company_size, location, description)
SELECT 
  '48a87477-776a-4a77-a7da-1d818fef6548',
  'Default Company',
  'Technology',
  '1-10',
  'Remote',
  'Default business profile'
WHERE NOT EXISTS (
  SELECT 1 FROM business_profiles 
  WHERE user_id = '48a87477-776a-4a77-a7da-1d818fef6548'
);

-- Update the job_listings RLS policies to be more permissive for business users
DROP POLICY IF EXISTS "job_listings_insert_owner" ON job_listings;

CREATE POLICY "job_listings_insert_business_users" 
ON job_listings 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'business'::app_role) 
  AND EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = job_listings.business_id 
    AND bp.user_id = auth.uid()
  )
);

-- Also update the business_profiles policies to allow better access
DROP POLICY IF EXISTS "business_profiles_select_own" ON business_profiles;

CREATE POLICY "business_profiles_select_own" 
ON business_profiles 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'business'::app_role));

-- Make sure business users can view their own profiles even without explicit ownership check
CREATE POLICY "business_profiles_select_business_role" 
ON business_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'business'::app_role));