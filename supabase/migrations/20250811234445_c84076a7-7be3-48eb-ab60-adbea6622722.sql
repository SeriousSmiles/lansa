-- 1) Create table with only safe public columns
CREATE TABLE IF NOT EXISTS public.user_profiles_public (
  user_id uuid PRIMARY KEY,
  name text,
  title text,
  about_text text,
  cover_color text,
  highlight_color text DEFAULT '#FF6B4A',
  profile_image text,
  skills text[],
  experiences jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  professional_goal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Enable RLS and allow public reads (safe columns only)
ALTER TABLE public.user_profiles_public ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles_public' AND policyname = 'Public can view shared profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view shared profiles" ON public.user_profiles_public FOR SELECT USING (true)';
  END IF;
END $$;

-- 3) Sync trigger from base table
CREATE OR REPLACE FUNCTION public.sync_user_profiles_public()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_user_profiles_public_iud ON public.user_profiles;
CREATE TRIGGER trg_sync_user_profiles_public_iud
AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_profiles_public();

-- 4) Backfill public rows
INSERT INTO public.user_profiles_public (
  user_id, name, title, about_text, cover_color, highlight_color,
  profile_image, skills, experiences, education, professional_goal,
  created_at, updated_at
)
SELECT 
  user_id, name, title, about_text, cover_color, highlight_color,
  profile_image, skills, experiences, education, professional_goal,
  COALESCE(created_at, now()), now()
FROM public.user_profiles
WHERE is_public = true
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

-- 5) Remove base-table public SELECT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Anyone can view public profiles'
  ) THEN
    DROP POLICY "Anyone can view public profiles" ON public.user_profiles;
  END IF;
END $$;