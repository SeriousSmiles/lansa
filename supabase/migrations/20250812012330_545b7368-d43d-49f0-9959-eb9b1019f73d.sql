-- Add flexible onboarding inputs and AI-generated card storage
ALTER TABLE public.user_answers
ADD COLUMN IF NOT EXISTS onboarding_inputs jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_onboarding_card jsonb;

-- Optional index to fetch latest non-null cards quickly (future-proof)
CREATE INDEX IF NOT EXISTS idx_user_answers_ai_card ON public.user_answers ((ai_onboarding_card IS NOT NULL));