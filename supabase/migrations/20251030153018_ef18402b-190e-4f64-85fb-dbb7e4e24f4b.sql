-- Storage policies for user-uploads bucket (organization logos)

-- Policy: Allow authenticated users to view all files in user-uploads
CREATE POLICY "Anyone can view user uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-uploads');

-- Policy: Allow public viewing of user-uploads (since bucket is public)
CREATE POLICY "Public can view user uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- Policy: Allow organization admins/owners to upload logos to their org folder
CREATE POLICY "Org admins can upload to their org folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[2]
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  )
);

-- Policy: Allow organization admins/owners to update logos in their org folder
CREATE POLICY "Org admins can update their org files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[2]
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  )
);

-- Policy: Allow organization admins/owners to delete logos in their org folder
CREATE POLICY "Org admins can delete their org files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[2]
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  )
);