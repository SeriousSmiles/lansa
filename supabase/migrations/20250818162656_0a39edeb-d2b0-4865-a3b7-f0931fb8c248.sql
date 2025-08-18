-- Add languages column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN languages jsonb DEFAULT '[]'::jsonb;