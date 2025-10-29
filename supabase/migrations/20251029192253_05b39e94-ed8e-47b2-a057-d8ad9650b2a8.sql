-- Add location fields to organizations table for better organization differentiation
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text;

-- Add index for search performance
CREATE INDEX IF NOT EXISTS idx_organizations_country ON public.organizations(country);

-- Add helpful comments
COMMENT ON COLUMN public.organizations.country IS 'Country where organization is headquartered (e.g., Kenya, United States, United Kingdom)';
COMMENT ON COLUMN public.organizations.city IS 'City/region where organization is headquartered';