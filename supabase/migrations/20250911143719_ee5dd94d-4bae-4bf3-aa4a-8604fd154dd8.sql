-- Add company logo to business onboarding data
ALTER TABLE business_onboarding_data ADD COLUMN company_logo TEXT;

-- Add job image to job listings
ALTER TABLE job_listings ADD COLUMN job_image TEXT;

-- Create storage policies for employer uploads (company logos)
CREATE POLICY "Employers can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Employers can view company logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-uploads');

CREATE POLICY "Employers can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);