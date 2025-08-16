-- Create career path enum
CREATE TYPE public.career_path_type AS ENUM ('student', 'visionary', 'entrepreneur', 'freelancer', 'business');

-- Add new columns to user_answers table
ALTER TABLE public.user_answers 
ADD COLUMN career_path career_path_type,
ADD COLUMN career_path_onboarding_completed boolean DEFAULT false;

-- Remove legacy columns from user_answers table
ALTER TABLE public.user_answers 
DROP COLUMN IF EXISTS question1,
DROP COLUMN IF EXISTS question2,
DROP COLUMN IF EXISTS question3,
DROP COLUMN IF EXISTS onboarding_completed,
DROP COLUMN IF EXISTS student_onboarding_completed;

-- Update user_profiles to ensure name fields exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Create function to extract user names from auth metadata
CREATE OR REPLACE FUNCTION public.extract_user_names_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Extract first_name and last_name from auth user metadata when profile is created/updated
  IF NEW.name IS NULL OR NEW.name = 'Lansa User' THEN
    -- Try to get name from auth.users metadata
    SELECT 
      COALESCE(
        CONCAT(
          COALESCE(raw_user_meta_data->>'first_name', ''),
          CASE 
            WHEN raw_user_meta_data->>'first_name' IS NOT NULL 
            AND raw_user_meta_data->>'last_name' IS NOT NULL 
            THEN ' ' 
            ELSE '' 
          END,
          COALESCE(raw_user_meta_data->>'last_name', '')
        ),
        raw_user_meta_data->>'full_name',
        email
      ),
      raw_user_meta_data->>'first_name',
      raw_user_meta_data->>'last_name'
    INTO NEW.name, NEW.first_name, NEW.last_name
    FROM auth.users 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS extract_user_names_trigger ON public.user_profiles;
CREATE TRIGGER extract_user_names_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.extract_user_names_from_auth();