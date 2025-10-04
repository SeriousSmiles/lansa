-- Phase 1: One-time migration to sync old onboarding flag to new flag
-- This ensures existing users aren't stuck

UPDATE user_profiles
SET onboarding_completed = true
WHERE user_id IN (
  SELECT user_id 
  FROM user_answers 
  WHERE career_path_onboarding_completed = true
)
AND (onboarding_completed IS NULL OR onboarding_completed = false);