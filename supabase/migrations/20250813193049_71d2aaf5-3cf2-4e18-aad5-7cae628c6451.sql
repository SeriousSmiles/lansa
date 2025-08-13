-- Add user_type to user_answers table
ALTER TABLE user_answers 
ADD COLUMN user_type TEXT CHECK (user_type IN ('job_seeker', 'employer'));

-- Create business_onboarding_data table for employers
CREATE TABLE business_onboarding_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT,
  business_size TEXT,
  role_function TEXT,
  business_services TEXT,
  open_job_listings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_onboarding_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own business data" 
ON business_onboarding_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business data" 
ON business_onboarding_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business data" 
ON business_onboarding_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamp updates
CREATE TRIGGER update_business_onboarding_data_updated_at
BEFORE UPDATE ON business_onboarding_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();