-- Create RLS policies for job images storage bucket
-- Allow authenticated users to upload their own job images
CREATE POLICY "Users can upload their own job images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'job-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to view all job images
CREATE POLICY "Anyone can view job images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'job-images'
);

-- Allow users to update their own job images
CREATE POLICY "Users can update their own job images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'job-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own job images
CREATE POLICY "Users can delete their own job images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'job-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);