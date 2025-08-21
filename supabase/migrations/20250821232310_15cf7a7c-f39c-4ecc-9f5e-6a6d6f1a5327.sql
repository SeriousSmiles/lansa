-- Fix existing users who completed onboarding but don't have proper completion flags
-- Users who have onboarding data but missing career_path_onboarding_completed flag

-- Update user_answers for users who have completed AI onboarding
UPDATE user_answers 
SET career_path_onboarding_completed = true
WHERE (
  ai_onboarding_card IS NOT NULL 
  OR onboarding_inputs IS NOT NULL 
  OR (identity IS NOT NULL AND desired_outcome IS NOT NULL)
  OR (career_path IS NOT NULL AND user_type IS NOT NULL)
) 
AND (career_path_onboarding_completed IS NULL OR career_path_onboarding_completed = false);

-- Also update user_answers for users who have onboarding_completed in user_profiles
UPDATE user_answers 
SET career_path_onboarding_completed = true
WHERE user_id IN (
  SELECT user_id 
  FROM user_profiles 
  WHERE onboarding_completed = true
) 
AND (career_path_onboarding_completed IS NULL OR career_path_onboarding_completed = false);