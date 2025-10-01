-- Enable RLS on job_skills table that was missed
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for job_skills (anyone can read skills for active jobs)
CREATE POLICY "skills_read_active_jobs" ON job_skills FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_listings_v2 
    WHERE id = job_skills.job_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);