-- Priority 1: Add missing columns to user_profiles_public table
ALTER TABLE public.user_profiles_public
  ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS biggest_challenge text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS location text;

-- Add documentation comments
COMMENT ON COLUMN public.user_profiles_public.languages IS 'User language proficiencies synced from user_profiles';
COMMENT ON COLUMN public.user_profiles_public.biggest_challenge IS 'User career challenge synced from user_profiles';
COMMENT ON COLUMN public.user_profiles_public.phone_number IS 'Contact phone number (respects privacy settings)';
COMMENT ON COLUMN public.user_profiles_public.email IS 'Contact email (respects privacy settings)';
COMMENT ON COLUMN public.user_profiles_public.location IS 'User geographic location';

-- Update sync trigger function to include new fields
CREATE OR REPLACE FUNCTION public.sync_user_profiles_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_profiles_public WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  IF NEW.is_public THEN
    INSERT INTO public.user_profiles_public (
      user_id, name, title, about_text, cover_color, highlight_color,
      profile_image, skills, experiences, education, professional_goal,
      languages, biggest_challenge, phone_number, email, location,
      created_at, updated_at
    )
    VALUES (
      NEW.user_id, NEW.name, NEW.title, NEW.about_text, NEW.cover_color, NEW.highlight_color,
      NEW.profile_image, NEW.skills, NEW.experiences, NEW.education, NEW.professional_goal,
      NEW.languages, NEW.biggest_challenge, NEW.phone_number, NEW.email, NEW.location,
      COALESCE(NEW.created_at, now()), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      title = EXCLUDED.title,
      about_text = EXCLUDED.about_text,
      cover_color = EXCLUDED.cover_color,
      highlight_color = EXCLUDED.highlight_color,
      profile_image = EXCLUDED.profile_image,
      skills = EXCLUDED.skills,
      experiences = EXCLUDED.experiences,
      education = EXCLUDED.education,
      professional_goal = EXCLUDED.professional_goal,
      languages = EXCLUDED.languages,
      biggest_challenge = EXCLUDED.biggest_challenge,
      phone_number = EXCLUDED.phone_number,
      email = EXCLUDED.email,
      location = EXCLUDED.location,
      updated_at = now();
  ELSE
    DELETE FROM public.user_profiles_public WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill existing public profiles with new data
UPDATE public.user_profiles_public upp
SET 
  languages = COALESCE(up.languages, '[]'::jsonb),
  biggest_challenge = up.biggest_challenge,
  phone_number = up.phone_number,
  email = up.email,
  location = up.location,
  updated_at = now()
FROM public.user_profiles up
WHERE upp.user_id = up.user_id
  AND up.is_public = true;