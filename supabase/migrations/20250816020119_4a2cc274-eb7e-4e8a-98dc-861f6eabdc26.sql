-- Create table for user power skills (skill reframes and AI interpretations)
CREATE TABLE public.user_power_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_skill TEXT NOT NULL,
  reframed_skill TEXT,
  ai_category TEXT,
  business_value_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user 90-day goals
CREATE TABLE public.user_90day_goal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_statement TEXT NOT NULL,
  ai_interpretation TEXT,
  initiative_type TEXT,
  clarity_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to user_profiles for student onboarding
ALTER TABLE public.user_profiles 
ADD COLUMN academic_status TEXT,
ADD COLUMN field_of_study TEXT,
ADD COLUMN career_goal_type TEXT;

-- Add student onboarding completion flag to user_answers
ALTER TABLE public.user_answers 
ADD COLUMN student_onboarding_completed BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.user_power_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_90day_goal ENABLE ROW LEVEL SECURITY;

-- Create policies for user_power_skills
CREATE POLICY "Users can view their own power skills" 
ON public.user_power_skills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own power skills" 
ON public.user_power_skills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own power skills" 
ON public.user_power_skills 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_90day_goal
CREATE POLICY "Users can view their own 90-day goals" 
ON public.user_90day_goal 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own 90-day goals" 
ON public.user_90day_goal 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 90-day goals" 
ON public.user_90day_goal 
FOR UPDATE 
USING (auth.uid() = user_id);