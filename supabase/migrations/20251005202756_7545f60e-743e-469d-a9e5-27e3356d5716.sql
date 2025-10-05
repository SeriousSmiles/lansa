-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('certification', 'award', 'project', 'skill', 'work', 'education')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_achieved DATE,
  organization TEXT,
  credential_id TEXT,
  credential_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
  ON user_achievements FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add achievements to user_profiles_public
ALTER TABLE user_profiles_public 
ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb;

-- Update sync_user_profiles_public function to include achievements
CREATE OR REPLACE FUNCTION public.sync_user_profiles_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  show_email boolean;
  show_phone boolean;
  public_data jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_profiles_public WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  IF NEW.is_public THEN
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
      updated_at = now();
  ELSE
    DELETE FROM public.user_profiles_public WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;