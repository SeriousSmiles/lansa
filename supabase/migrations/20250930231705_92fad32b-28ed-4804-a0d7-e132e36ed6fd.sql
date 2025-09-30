-- Extend job_listings table with new fields for feed functionality
ALTER TABLE public.job_listings
ADD COLUMN IF NOT EXISTS target_user_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS salary_range text,
ADD COLUMN IF NOT EXISTS job_type text DEFAULT 'full_time',
ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false;

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_job_listings_target_user_types ON public.job_listings USING GIN(target_user_types);
CREATE INDEX IF NOT EXISTS idx_job_listings_category ON public.job_listings (category);
CREATE INDEX IF NOT EXISTS idx_job_listings_expires_at ON public.job_listings (expires_at);
CREATE INDEX IF NOT EXISTS idx_job_listings_active_created ON public.job_listings (is_active, created_at DESC);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  applicant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'declined', 'matched', 'withdrawn')),
  cover_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  viewed_at timestamp with time zone,
  responded_at timestamp with time zone,
  UNIQUE(job_id, applicant_user_id)
);

-- Add indices for job_applications
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON public.job_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_applications

-- Applicants can view their own applications
CREATE POLICY "Applicants can view their own applications"
ON public.job_applications
FOR SELECT
USING (applicant_user_id = auth.uid());

-- Applicants can create applications
CREATE POLICY "Users can apply for jobs"
ON public.job_applications
FOR INSERT
WITH CHECK (applicant_user_id = auth.uid());

-- Applicants can withdraw their own applications
CREATE POLICY "Applicants can update their own applications"
ON public.job_applications
FOR UPDATE
USING (applicant_user_id = auth.uid());

-- Recruiters can view applications for their jobs
CREATE POLICY "Recruiters can view applications for their jobs"
ON public.job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_listings jl
    JOIN public.business_profiles bp ON bp.id = jl.business_id
    WHERE jl.id = job_applications.job_id 
    AND bp.user_id = auth.uid()
  )
);

-- Recruiters can update application status for their jobs
CREATE POLICY "Recruiters can update applications for their jobs"
ON public.job_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.job_listings jl
    JOIN public.business_profiles bp ON bp.id = jl.business_id
    WHERE jl.id = job_applications.job_id 
    AND bp.user_id = auth.uid()
  )
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment explaining target_user_types
COMMENT ON COLUMN public.job_listings.target_user_types IS 'Array of user types this job targets: student, visionary, entrepreneur, freelancer, etc.';