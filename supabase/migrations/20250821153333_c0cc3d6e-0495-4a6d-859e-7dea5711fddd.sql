-- Add new columns to existing user_power_skills table
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS value_statements TEXT[] DEFAULT '{}';
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS value_tags TEXT[] DEFAULT '{}';
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS clarity_score FLOAT DEFAULT 0.0;
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS specificity_score FLOAT DEFAULT 0.0;
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS employer_relevance_score FLOAT DEFAULT 0.0;
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS overall_strength FLOAT DEFAULT 0.0;
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE user_power_skills ADD COLUMN IF NOT EXISTS follow_up_question TEXT;

-- Add new columns to existing user_90day_goal table
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS assumptions TEXT[] DEFAULT '{}';
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS success_metric TEXT;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS risk_notes TEXT[] DEFAULT '{}';
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS clarity_score FLOAT DEFAULT 0.0;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS specificity_score FLOAT DEFAULT 0.0;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS employer_relevance_score FLOAT DEFAULT 0.0;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS overall_strength FLOAT DEFAULT 0.0;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE user_90day_goal ADD COLUMN IF NOT EXISTS follow_up_question TEXT;

-- Add new columns to existing user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS academic_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS career_goal_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create ai_mirror_reviews table
CREATE TABLE IF NOT EXISTS public.ai_mirror_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('skill', 'goal')),
  manager_read TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',
  hire_signal_score FLOAT NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_mirror_reviews
ALTER TABLE public.ai_mirror_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_mirror_reviews
CREATE POLICY "Users can view their own mirror reviews" 
ON public.ai_mirror_reviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mirror reviews" 
ON public.ai_mirror_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mirror reviews" 
ON public.ai_mirror_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create ai_insights table for dashboard coaching
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_text TEXT NOT NULL,
  action_link TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_insights
CREATE POLICY "Users can view their own insights" 
ON public.ai_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" 
ON public.ai_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create ai_logs table for observability
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_hash TEXT NOT NULL,
  expert TEXT NOT NULL,
  model_used TEXT NOT NULL,
  latency_ms INTEGER,
  token_count INTEGER,
  input_hash TEXT NOT NULL,
  error_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_logs (admin only)
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_logs (admin access only for now)
CREATE POLICY "Admins can view all ai logs" 
ON public.ai_logs 
FOR SELECT 
USING (true); -- Will be restricted to admin role later