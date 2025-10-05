-- Priority 2: Add privacy settings column to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"show_email": false, "show_phone": false}'::jsonb;

COMMENT ON COLUMN public.user_profiles.privacy_settings IS 'User privacy preferences for public profile sharing';

-- Update sync trigger to respect privacy settings
CREATE OR REPLACE FUNCTION public.sync_user_profiles_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  show_email boolean;
  show_phone boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_profiles_public WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  IF NEW.is_public THEN
    -- Extract privacy settings
    show_email := COALESCE((NEW.privacy_settings->>'show_email')::boolean, false);
    show_phone := COALESCE((NEW.privacy_settings->>'show_phone')::boolean, false);
    
    INSERT INTO public.user_profiles_public (
      user_id, name, title, about_text, cover_color, highlight_color,
      profile_image, skills, experiences, education, professional_goal,
      languages, biggest_challenge, 
      phone_number, email, location,
      created_at, updated_at
    )
    VALUES (
      NEW.user_id, NEW.name, NEW.title, NEW.about_text, NEW.cover_color, NEW.highlight_color,
      NEW.profile_image, NEW.skills, NEW.experiences, NEW.education, NEW.professional_goal,
      NEW.languages, NEW.biggest_challenge,
      CASE WHEN show_phone THEN NEW.phone_number ELSE NULL END,
      CASE WHEN show_email THEN NEW.email ELSE NULL END,
      NEW.location,
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