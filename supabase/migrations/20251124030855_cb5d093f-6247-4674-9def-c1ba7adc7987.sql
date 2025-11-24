-- Phase 1: Database Schema Updates for Certification Exam Refactor

-- Update cert_questions table: Add new columns for written questions and timing
ALTER TABLE cert_questions
  ADD COLUMN IF NOT EXISTS question_type text DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'written')),
  ADD COLUMN IF NOT EXISTS guidance text,
  ADD COLUMN IF NOT EXISTS max_words int DEFAULT 50,
  ADD COLUMN IF NOT EXISTS time_limit_seconds int DEFAULT 40;

-- Update cert_answers table: Add response time and written answer support
ALTER TABLE cert_answers
  ADD COLUMN IF NOT EXISTS response_time_sec int,
  ADD COLUMN IF NOT EXISTS written_answer_text text;

-- Update cert_results table: Add comprehensive AI analysis fields
ALTER TABLE cert_results
  ADD COLUMN IF NOT EXISTS strengths text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS focus_areas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS insights jsonb,
  ADD COLUMN IF NOT EXISTS per_question_reflections jsonb,
  ADD COLUMN IF NOT EXISTS high_performer boolean DEFAULT false;

-- Add helpful comments
COMMENT ON COLUMN cert_questions.question_type IS 'Type of question: mcq (multiple choice) or written (text response)';
COMMENT ON COLUMN cert_questions.guidance IS 'Guidance text for written questions (e.g., "Focus on accountability, solution, timeline")';
COMMENT ON COLUMN cert_questions.max_words IS 'Maximum word count for written questions';
COMMENT ON COLUMN cert_questions.time_limit_seconds IS 'Time limit in seconds (40 for mcq, 60 for written)';

COMMENT ON COLUMN cert_answers.response_time_sec IS 'Seconds taken to answer the question';
COMMENT ON COLUMN cert_answers.written_answer_text IS 'Text answer for written questions';

COMMENT ON COLUMN cert_results.strengths IS 'Array of user strengths extracted by AI (e.g., ["Accountability", "Clear communication"])';
COMMENT ON COLUMN cert_results.focus_areas IS 'Array of areas for improvement extracted by AI (e.g., ["Expectation management"])';
COMMENT ON COLUMN cert_results.insights IS 'JSON containing category_cards and mini_report from AI analysis';
COMMENT ON COLUMN cert_results.per_question_reflections IS 'JSON array of per-question reflection lines from AI';
COMMENT ON COLUMN cert_results.high_performer IS 'True if all category scores >= 80%';