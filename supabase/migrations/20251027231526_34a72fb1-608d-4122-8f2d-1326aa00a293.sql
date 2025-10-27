-- Create trigger function to sync company logo from business_onboarding_data to companies
CREATE OR REPLACE FUNCTION public.sync_company_logo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update companies table logo_url when business_onboarding_data.company_logo changes
  -- Match by company name
  IF NEW.company_logo IS NOT NULL AND NEW.company_name IS NOT NULL THEN
    UPDATE public.companies
    SET logo_url = NEW.company_logo
    WHERE LOWER(name) = LOWER(NEW.company_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on business_onboarding_data
DROP TRIGGER IF EXISTS sync_company_logo_trigger ON public.business_onboarding_data;
CREATE TRIGGER sync_company_logo_trigger
AFTER INSERT OR UPDATE OF company_logo, company_name
ON public.business_onboarding_data
FOR EACH ROW
EXECUTE FUNCTION public.sync_company_logo();

-- Backfill existing data: sync all existing logos from business_onboarding_data to companies
UPDATE public.companies c
SET logo_url = bod.company_logo
FROM public.business_onboarding_data bod
WHERE LOWER(c.name) = LOWER(bod.company_name)
  AND bod.company_logo IS NOT NULL
  AND (c.logo_url IS NULL OR c.logo_url != bod.company_logo);