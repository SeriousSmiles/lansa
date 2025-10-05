-- Create table for AI feedback logging
CREATE TABLE IF NOT EXISTS public.ai_feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  section TEXT NOT NULL,
  input_text TEXT NOT NULL,
  ai_suggestion TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  score JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_feedback_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own AI feedback logs
CREATE POLICY "Users can view their own AI feedback logs"
  ON public.ai_feedback_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Allow system to insert logs
CREATE POLICY "System can insert AI feedback logs"
  ON public.ai_feedback_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_ai_feedback_log_user_id ON public.ai_feedback_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_log_section ON public.ai_feedback_log(section);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_log_created_at ON public.ai_feedback_log(created_at DESC);