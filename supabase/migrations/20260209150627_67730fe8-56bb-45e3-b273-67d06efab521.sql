
-- Add approval_status to mentor_profiles
ALTER TABLE public.mentor_profiles
ADD COLUMN approval_status text NOT NULL DEFAULT 'pending'
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add rejected_reason column for admin feedback
ALTER TABLE public.mentor_profiles
ADD COLUMN rejected_reason text;

-- Add approved_at and approved_by for audit trail
ALTER TABLE public.mentor_profiles
ADD COLUMN approved_at timestamp with time zone;
ALTER TABLE public.mentor_profiles
ADD COLUMN approved_by uuid;

-- Update the content_videos INSERT policy to also require approved mentor status
DROP POLICY IF EXISTS "Mentors can insert their own videos" ON public.content_videos;
CREATE POLICY "Mentors can insert their own videos"
ON public.content_videos
FOR INSERT
TO authenticated
WITH CHECK (
  mentor_id = auth.uid()
  AND check_mentor_video_limit(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.user_id = auth.uid() AND mp.approval_status = 'approved'
  )
);

-- Update the content_videos UPDATE policy to require approved status for publishing
DROP POLICY IF EXISTS "Mentors can update their own videos" ON public.content_videos;
CREATE POLICY "Mentors can update their own videos"
ON public.content_videos
FOR UPDATE
TO authenticated
USING (mentor_id = auth.uid())
WITH CHECK (
  mentor_id = auth.uid()
  AND (
    is_published = false
    OR EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.user_id = auth.uid() AND mp.approval_status = 'approved'
    )
  )
);
