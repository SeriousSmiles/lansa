-- Create enum types for certification system
CREATE TYPE exam_sector AS ENUM ('office', 'service', 'technical', 'digital');
CREATE TYPE exam_category AS ENUM ('mindset', 'workplace_intelligence', 'performance_habits', 'applied_thinking');
CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE certification_level AS ENUM ('standard', 'high_performer');

-- Table: cert_questions (renamed to avoid conflict)
CREATE TABLE public.cert_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector exam_sector NOT NULL,
  category exam_category NOT NULL,
  scenario TEXT NOT NULL,
  choices JSONB NOT NULL,
  mirror_role TEXT NOT NULL,
  mirror_context TEXT NOT NULL,
  randomize_order BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: cert_sessions
CREATE TABLE public.cert_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sector exam_sector NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  status exam_status NOT NULL DEFAULT 'in_progress',
  selected_questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: cert_answers
CREATE TABLE public.cert_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.cert_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.cert_questions(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  points_awarded INTEGER NOT NULL,
  ai_mirror_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: cert_results
CREATE TABLE public.cert_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.cert_sessions(id) ON DELETE CASCADE,
  sector exam_sector NOT NULL,
  total_score NUMERIC(5,2) NOT NULL,
  category_scores JSONB NOT NULL,
  pass_fail BOOLEAN NOT NULL,
  ai_summary_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: cert_certifications
CREATE TABLE public.cert_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sector exam_sector NOT NULL,
  level certification_level NOT NULL DEFAULT 'standard',
  date_issued TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_code TEXT NOT NULL UNIQUE,
  result_id UUID NOT NULL REFERENCES public.cert_results(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cert_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cert_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cert_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cert_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cert_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view questions"
ON public.cert_questions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own sessions"
ON public.cert_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.cert_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.cert_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own answers"
ON public.cert_answers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.cert_sessions
  WHERE cert_sessions.id = cert_answers.session_id
  AND cert_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own answers"
ON public.cert_answers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.cert_sessions
  WHERE cert_sessions.id = session_id
  AND cert_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can view their own results"
ON public.cert_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
ON public.cert_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own certifications"
ON public.cert_certifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view certifications by verification code"
ON public.cert_certifications FOR SELECT
USING (true);

-- Indexes
CREATE INDEX idx_cert_questions_sector ON public.cert_questions(sector);
CREATE INDEX idx_cert_questions_category ON public.cert_questions(category);
CREATE INDEX idx_cert_sessions_user_id ON public.cert_sessions(user_id);
CREATE INDEX idx_cert_sessions_sector ON public.cert_sessions(sector);
CREATE INDEX idx_cert_answers_session_id ON public.cert_answers(session_id);
CREATE INDEX idx_cert_results_user_id ON public.cert_results(user_id);
CREATE INDEX idx_cert_certifications_user_id ON public.cert_certifications(user_id);
CREATE INDEX idx_cert_certifications_verification_code ON public.cert_certifications(verification_code);

-- Triggers
CREATE TRIGGER update_cert_questions_updated_at
BEFORE UPDATE ON public.cert_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cert_sessions_updated_at
BEFORE UPDATE ON public.cert_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verification code function
CREATE OR REPLACE FUNCTION generate_cert_verification_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'LANSA-' || upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.cert_certifications WHERE verification_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;