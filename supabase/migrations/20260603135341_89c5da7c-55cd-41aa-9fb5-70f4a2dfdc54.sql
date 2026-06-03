
-- Add 'job' context for job swipe deck
ALTER TYPE public.match_context ADD VALUE IF NOT EXISTS 'job';

-- Drop legacy FK that points to old job_listings; job_listing_id will reference job_listings_v2 logically
ALTER TABLE public.swipes DROP CONSTRAINT IF EXISTS swipes_job_listing_id_fkey;

-- Cached AI bullet summary for job cards
ALTER TABLE public.job_listings_v2 ADD COLUMN IF NOT EXISTS ai_summary_bullets jsonb;
