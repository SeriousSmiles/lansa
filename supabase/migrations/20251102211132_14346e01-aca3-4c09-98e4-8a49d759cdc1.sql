-- Enable RLS for user-uploads bucket
-- Allow authenticated users to upload job images to their own folders

-- Select policy: Allow public read access to user-uploads bucket
CREATE POLICY "user_uploads_select_public"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Insert policy: Allow authenticated users to upload to their own job-images folder
CREATE POLICY "user_uploads_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'job-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Update policy: Allow authenticated users to update their own files
CREATE POLICY "user_uploads_update_own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Delete policy: Allow authenticated users to delete their own files
CREATE POLICY "user_uploads_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
);