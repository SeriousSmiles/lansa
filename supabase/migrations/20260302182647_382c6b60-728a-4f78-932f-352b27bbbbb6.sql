
-- Update sync_user_profiles_public trigger to also sync certified+visible_to_employers profiles
-- even if is_public is false
CREATE OR REPLACE FUNCTION public.sync_user_profiles_public()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  show_email boolean;
  show_phone boolean;
  public_data jsonb;
  should_be_public boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_profiles_public WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  -- Profile should be publicly visible if:
  -- 1. User explicitly set is_public = true, OR
  -- 2. User is certified (certified = true) AND visible_to_employers = true
  should_be_public := NEW.is_public OR (COALESCE(NEW.certified, false) AND COALESCE(NEW.visible_to_employers, false));

  IF should_be_public THEN
    show_email := COALESCE((NEW.privacy_settings->>'show_email')::boolean, false);
    show_phone := COALESCE((NEW.privacy_settings->>'show_phone')::boolean, false);
    
    public_data := jsonb_build_object(
      'user_id', NEW.user_id,
      'name', NEW.name,
      'title', NEW.title,
      'about_text', NEW.about_text,
      'cover_color', NEW.cover_color,
      'highlight_color', NEW.highlight_color,
      'profile_image', NEW.profile_image,
      'skills', NEW.skills,
      'experiences', NEW.experiences,
      'education', NEW.education,
      'professional_goal', NEW.professional_goal,
      'languages', NEW.languages,
      'biggest_challenge', NEW.biggest_challenge,
      'phone_number', CASE WHEN show_phone THEN NEW.phone_number ELSE NULL END,
      'email', CASE WHEN show_email THEN NEW.email ELSE NULL END,
      'location', NEW.location,
      'achievements', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'type', a.type,
            'title', a.title,
            'description', a.description,
            'date_achieved', a.date_achieved,
            'organization', a.organization,
            'credential_id', a.credential_id,
            'is_featured', a.is_featured
          ) ORDER BY a.is_featured DESC, a.date_achieved DESC NULLS LAST
        )
        FROM user_achievements a
        WHERE a.user_id = NEW.user_id
      ),
      'certifications', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'title', c.title,
            'issuer', c.issuer,
            'issue_date', c.issue_date,
            'expiry_date', c.expiry_date,
            'credential_id', c.credential_id,
            'description', c.description
          ) ORDER BY c.issue_date DESC NULLS LAST
        )
        FROM user_profile_certifications c
        WHERE c.user_id = NEW.user_id
      ),
      'created_at', COALESCE(NEW.created_at, now()),
      'updated_at', now()
    );
    
    INSERT INTO public.user_profiles_public
    SELECT * FROM jsonb_populate_record(null::user_profiles_public, public_data)
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
      achievements = EXCLUDED.achievements,
      certifications = EXCLUDED.certifications,
      updated_at = now();
  ELSE
    DELETE FROM public.user_profiles_public WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill: sync all certified+visible_to_employers profiles that are currently missing from user_profiles_public
UPDATE public.user_profiles
SET updated_at = now()
WHERE certified = true 
AND visible_to_employers = true
AND user_id NOT IN (SELECT user_id FROM public.user_profiles_public);
