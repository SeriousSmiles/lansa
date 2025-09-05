-- Add hire_rate_score column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN hire_rate_score INTEGER DEFAULT 0 CHECK (hire_rate_score >= 0 AND hire_rate_score <= 100);

-- Add score_breakdown to store detailed scoring components
ALTER TABLE public.user_profiles 
ADD COLUMN score_breakdown JSONB DEFAULT '{
  "profile_completion": 0,
  "profile_quality": 0,  
  "engagement_level": 0,
  "onboarding_completion": 0
}'::jsonb;