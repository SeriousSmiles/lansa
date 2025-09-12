-- Add CV upload tracking fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN cv_imported_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cv_source_metadata JSONB DEFAULT '{}',
ADD COLUMN cv_last_used TIMESTAMP WITH TIME ZONE;