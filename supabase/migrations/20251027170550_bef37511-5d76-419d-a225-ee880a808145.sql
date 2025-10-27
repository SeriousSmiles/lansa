-- Allow employers to view profiles of job applicants
-- This policy enables employers to see basic profile information of users who have applied to their job postings

CREATE POLICY "Employers can view applicant profiles"
ON public.user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.job_applications_v2 ja
    INNER JOIN public.job_listings_v2 jl ON ja.job_id = jl.id
    WHERE ja.applicant_user_id = user_profiles.user_id
      AND jl.created_by = auth.uid()
  )
);