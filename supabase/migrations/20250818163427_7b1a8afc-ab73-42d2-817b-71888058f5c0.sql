-- Update the sync function to include languages
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
      created_at, updated_at
    )
    VALUES (
      NEW.user_id, NEW.name, NEW.title, NEW.about_text, NEW.cover_color, NEW.highlight_color,
      NEW.profile_image, NEW.skills, NEW.experiences, NEW.education, NEW.professional_goal,
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
      updated_at = now();
  ELSE
    DELETE FROM public.user_profiles_public WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$