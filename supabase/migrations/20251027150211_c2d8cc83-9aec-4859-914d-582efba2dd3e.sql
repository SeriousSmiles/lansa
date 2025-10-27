-- Add policy for employers to view all their own jobs (active/inactive/expired)
CREATE POLICY "recruiters_select_own" 
ON public.job_listings_v2
FOR SELECT 
USING (created_by = auth.uid());