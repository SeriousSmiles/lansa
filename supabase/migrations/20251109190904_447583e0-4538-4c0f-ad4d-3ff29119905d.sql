-- Resume Editor Backend Tables

-- 1. resume_templates: System-provided resume templates
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'modern', 'professional', 'creative', 'ats'
  thumbnail_url TEXT,
  design_json JSONB NOT NULL, -- Vector-based layout definition
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. resume_designs: User-created resume designs
CREATE TABLE IF NOT EXISTS public.resume_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Resume',
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE SET NULL,
  design_json JSONB NOT NULL, -- Current design state (canvas + layers)
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. resume_exports: Export history and cached files
CREATE TABLE IF NOT EXISTS public.resume_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.resume_designs(id) ON DELETE CASCADE,
  format TEXT NOT NULL, -- 'pdf', 'png', 'jpeg'
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL, -- For cache invalidation
  options JSONB, -- Export options (include_photo, ats_mode, sections)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Indexes for performance
CREATE INDEX idx_resume_designs_user_id ON public.resume_designs(user_id);
CREATE INDEX idx_resume_designs_template_id ON public.resume_designs(template_id);
CREATE INDEX idx_resume_exports_user_id ON public.resume_exports(user_id);
CREATE INDEX idx_resume_exports_file_hash ON public.resume_exports(file_hash);
CREATE INDEX idx_resume_exports_expires_at ON public.resume_exports(expires_at);

-- RLS Policies

-- resume_templates: Public read access
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON public.resume_templates FOR SELECT
  USING (is_active = true);

-- resume_designs: Users manage their own designs
ALTER TABLE public.resume_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own designs"
  ON public.resume_designs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own designs"
  ON public.resume_designs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own designs"
  ON public.resume_designs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own designs"
  ON public.resume_designs FOR DELETE
  USING (user_id = auth.uid());

-- resume_exports: Users access their own exports
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports"
  ON public.resume_exports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exports"
  ON public.resume_exports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Trigger to update updated_at on resume_designs
CREATE OR REPLACE FUNCTION update_resume_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resume_designs_updated_at
  BEFORE UPDATE ON public.resume_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_designs_updated_at();

-- Trigger to update updated_at on resume_templates
CREATE TRIGGER trigger_update_resume_templates_updated_at
  BEFORE UPDATE ON public.resume_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_designs_updated_at();