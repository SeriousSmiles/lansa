-- Create user_job_preferences table for storing job filtering preferences
CREATE TABLE IF NOT EXISTS public.user_job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  is_remote_preferred BOOLEAN DEFAULT false,
  location_preferences TEXT[] DEFAULT '{}',
  filtering_mode TEXT NOT NULL DEFAULT 'lite' CHECK (filtering_mode IN ('strict', 'lite')),
  preferences_set_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_job_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_job_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_job_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_job_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_job_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_job_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Companies can view preferences of certified job seekers (for matching)
CREATE POLICY "Companies can view certified users preferences"
  ON public.user_job_preferences
  FOR SELECT
  USING (
    has_role(auth.uid(), 'business'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.user_certifications uc
      WHERE uc.user_id = user_job_preferences.user_id
        AND uc.lansa_certified = true
        AND uc.verified = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_user_job_preferences_updated_at
  BEFORE UPDATE ON public.user_job_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();