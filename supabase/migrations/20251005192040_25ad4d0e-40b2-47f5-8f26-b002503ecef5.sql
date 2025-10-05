-- Priority 3: Refactor sync trigger for better maintainability and add documentation

-- Add documentation comment to public profiles table
COMMENT ON TABLE public.user_profiles_public IS 'Public-facing user profiles for sharing. Automatically synced from user_profiles when is_public=true via sync_user_profiles_public() trigger. Respects privacy settings for email and phone visibility.';

-- Refactored sync trigger using jsonb_build_object for easier maintenance
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
BEGIN
  -- Handle deletion: remove from public table
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_profiles_public WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  -- Only sync if profile is marked as public
  IF NEW.is_public THEN
    -- Extract privacy settings (default to false if not set)
    show_email := COALESCE((NEW.privacy_settings->>'show_email')::boolean, false);
    show_phone := COALESCE((NEW.privacy_settings->>'show_phone')::boolean, false);
    
    -- Build the public data object
    -- This approach makes it easier to add/remove fields in the future
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
      'created_at', COALESCE(NEW.created_at, now()),
      'updated_at', now()
    );
    
    -- Upsert using the jsonb object
    -- jsonb_populate_record converts the jsonb to a proper record type
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
      updated_at = now();
  ELSE
    -- Profile is no longer public, remove from public table
    DELETE FROM public.user_profiles_public WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS sync_user_profiles_trigger ON public.user_profiles;

CREATE TRIGGER sync_user_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profiles_public();

COMMENT ON TRIGGER sync_user_profiles_trigger ON public.user_profiles IS 'Automatically syncs profile data to user_profiles_public table when is_public flag is enabled, respecting privacy settings. Updates are real-time via database trigger.';

-- Add index on user_profiles_public for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_public_user_id 
ON public.user_profiles_public(user_id);

COMMENT ON INDEX idx_user_profiles_public_user_id IS 'Improves lookup performance for public profile queries by user_id';