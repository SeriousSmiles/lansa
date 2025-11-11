-- Emergency fix: Auto-complete onboarding for users stuck in limbo
-- These users have user_type and career_path but no onboarding_completed flags

-- Update user_profiles for users with user_type in user_answers but no onboarding flag
UPDATE user_profiles up
SET 
  onboarding_completed = true,
  updated_at = now()
WHERE up.user_id IN (
  SELECT ua.user_id 
  FROM user_answers ua
  WHERE ua.user_type IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles p 
      WHERE p.user_id = ua.user_id 
      AND p.onboarding_completed = true
    )
)
AND up.onboarding_completed IS DISTINCT FROM true;

-- Update user_answers legacy flag for consistency
UPDATE user_answers ua
SET 
  career_path_onboarding_completed = true
WHERE ua.user_type IS NOT NULL
  AND (ua.career_path_onboarding_completed IS NULL OR ua.career_path_onboarding_completed = false);

-- Log this recovery action for analytics
INSERT INTO user_actions (user_id, action_type, metadata)
SELECT 
  ua.user_id,
  'onboarding_auto_recovered',
  jsonb_build_object(
    'recovery_type', 'migration_fix',
    'user_type', ua.user_type,
    'career_path', ua.career_path,
    'timestamp', now()
  )
FROM user_answers ua
WHERE ua.user_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_actions uat
    WHERE uat.user_id = ua.user_id 
    AND uat.action_type = 'onboarding_auto_recovered'
  );

-- Create index for faster onboarding status checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed 
ON user_profiles(user_id, onboarding_completed) 
WHERE onboarding_completed = true;

CREATE INDEX IF NOT EXISTS idx_user_answers_user_type 
ON user_answers(user_id, user_type) 
WHERE user_type IS NOT NULL;