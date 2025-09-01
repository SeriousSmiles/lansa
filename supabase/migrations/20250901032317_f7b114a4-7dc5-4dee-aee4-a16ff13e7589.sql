-- Step 1: Fix existing business onboarding data by setting user_type to 'employer'
UPDATE user_answers 
SET user_type = 'employer'
WHERE user_id IN (
  SELECT user_id 
  FROM business_onboarding_data
) AND (user_type IS NULL OR user_type != 'employer');

-- Step 2: Create business_profiles only for users who don't have them
INSERT INTO business_profiles (user_id, company_name, company_size, description, created_at, updated_at)
SELECT DISTINCT ON (bod.user_id)
  bod.user_id,
  bod.company_name,
  bod.business_size,
  CONCAT('Role: ', COALESCE(bod.role_function, 'Not specified'), '. Services: ', COALESCE(bod.business_services, 'Not specified')) as description,
  bod.created_at,
  now()
FROM business_onboarding_data bod
WHERE NOT EXISTS (
  SELECT 1 FROM business_profiles bp WHERE bp.user_id = bod.user_id
);

-- Step 3: Add user roles for employers who don't have them yet
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT user_id, 'business'::app_role
FROM business_onboarding_data
WHERE user_id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'business'::app_role
);

-- Step 4: Update user_profiles to mark onboarding as completed for employers
UPDATE user_profiles 
SET onboarding_completed = true, updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM business_onboarding_data
) AND (onboarding_completed IS NULL OR onboarding_completed = false);