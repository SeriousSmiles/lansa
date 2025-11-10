-- Phase 1: Database Schema Updates for Component-Based Resume Editor

-- 1.1 Create resume_section_components table
-- Stores the library of available section component templates
CREATE TABLE IF NOT EXISTS public.resume_section_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE, -- 'header', 'experience', 'education', 'skills', 'summary', 'languages', 'projects', 'certifications', 'achievements', 'custom'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'professional', 'creative', 'custom'
  icon TEXT NOT NULL DEFAULT 'FileText',
  thumbnail_url TEXT,
  default_design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on resume_section_components
ALTER TABLE public.resume_section_components ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active section components
CREATE POLICY "section_components_select_active" 
ON public.resume_section_components 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 1.2 Create resume_sections table
-- Stores user-added section instances in their resume
CREATE TABLE IF NOT EXISTS public.resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_design_id UUID NOT NULL REFERENCES public.resume_designs(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL, -- References resume_section_components.type
  position INTEGER NOT NULL DEFAULT 0,
  custom_design_json JSONB,
  custom_data JSONB,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  layout_config JSONB NOT NULL DEFAULT '{"width": "full", "columns": 1}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_resume_sections_design_position ON public.resume_sections(resume_design_id, position);

-- Enable RLS on resume_sections
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;

-- Users can view their own resume sections
CREATE POLICY "resume_sections_select_own" 
ON public.resume_sections 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.resume_designs rd
    WHERE rd.id = resume_sections.resume_design_id
    AND rd.user_id = auth.uid()
  )
);

-- Users can insert sections to their own resumes
CREATE POLICY "resume_sections_insert_own" 
ON public.resume_sections 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resume_designs rd
    WHERE rd.id = resume_sections.resume_design_id
    AND rd.user_id = auth.uid()
  )
);

-- Users can update their own resume sections
CREATE POLICY "resume_sections_update_own" 
ON public.resume_sections 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.resume_designs rd
    WHERE rd.id = resume_sections.resume_design_id
    AND rd.user_id = auth.uid()
  )
);

-- Users can delete their own resume sections
CREATE POLICY "resume_sections_delete_own" 
ON public.resume_sections 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.resume_designs rd
    WHERE rd.id = resume_sections.resume_design_id
    AND rd.user_id = auth.uid()
  )
);

-- 1.3 Update resume_designs table
ALTER TABLE public.resume_designs
ADD COLUMN IF NOT EXISTS layout_settings JSONB DEFAULT '{"columns": 1, "spacing": "medium", "margins": "standard", "pageSize": "A4"}'::jsonb,
ADD COLUMN IF NOT EXISTS global_styles JSONB DEFAULT '{"fontFamily": "Inter", "primaryColor": "#000000", "secondaryColor": "#666666", "baseFontSize": 12}'::jsonb;

-- Create trigger to update updated_at on resume_sections
CREATE OR REPLACE FUNCTION public.update_resume_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_resume_sections_updated_at
BEFORE UPDATE ON public.resume_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_resume_sections_updated_at();

-- Seed initial section components
INSERT INTO public.resume_section_components (type, name, description, category, icon, is_featured, data_schema, default_design_json) VALUES
('header', 'Header', 'Name, title, and contact information', 'basic', 'User', true, 
  '{"fields": ["name", "title", "email", "phone", "location"], "repeatable": false}'::jsonb,
  '{"height": 120, "spacing": 10}'::jsonb
),
('summary', 'Professional Summary', 'Brief overview of your professional background', 'basic', 'FileText', true,
  '{"fields": ["aboutText", "professionalGoal"], "repeatable": false}'::jsonb,
  '{"height": 100, "spacing": 10}'::jsonb
),
('experience', 'Work Experience', 'Your professional work history', 'professional', 'Briefcase', true,
  '{"fields": ["experiences"], "repeatable": true}'::jsonb,
  '{"entryHeight": 120, "spacing": 15}'::jsonb
),
('education', 'Education', 'Your academic background', 'basic', 'GraduationCap', true,
  '{"fields": ["education"], "repeatable": true}'::jsonb,
  '{"entryHeight": 100, "spacing": 15}'::jsonb
),
('skills', 'Skills', 'Technical and professional skills', 'basic', 'Wrench', true,
  '{"fields": ["skills"], "repeatable": false}'::jsonb,
  '{"height": 80, "columns": 3}'::jsonb
),
('languages', 'Languages', 'Language proficiencies', 'basic', 'Globe', false,
  '{"fields": ["languages"], "repeatable": false}'::jsonb,
  '{"height": 70, "columns": 2}'::jsonb
),
('projects', 'Projects', 'Notable projects and portfolio work', 'creative', 'FolderOpen', false,
  '{"fields": ["projects"], "repeatable": true}'::jsonb,
  '{"entryHeight": 110, "spacing": 15}'::jsonb
),
('certifications', 'Training & Courses', 'Certifications and professional development', 'professional', 'Award', false,
  '{"fields": ["certifications"], "repeatable": true}'::jsonb,
  '{"entryHeight": 80, "spacing": 12}'::jsonb
),
('achievements', 'Key Achievements', 'Notable accomplishments and awards', 'professional', 'Trophy', false,
  '{"fields": ["achievements"], "repeatable": true}'::jsonb,
  '{"entryHeight": 90, "spacing": 12}'::jsonb
);