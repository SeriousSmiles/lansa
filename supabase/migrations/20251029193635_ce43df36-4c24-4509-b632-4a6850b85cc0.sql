-- Scenario A: Cleanup Lansa Duplicate Organizations with Data Migration (Fixed v2)
-- Keep latest org (31bc1d76-992f-42e8-ac9e-9dcaf0a53941) and migrate all data to it

-- Step 1: Update latest organization with complete information
UPDATE organizations
SET 
  logo_url = 'https://hrmklkcdxkeyttboosgr.supabase.co/storage/v1/object/public/user-uploads/company-logos/24df69fd-6926-4909-a19b-b6eef70c0cfa/1761522640949-Lansa_Logo_black_and_White.jpg',
  description = 'Lansa is a software company that gives young professionals something better to offer and connect them with businesses that needs them',
  website = 'https://www.lansa.online',
  domain = 'lansa.online',
  industry = 'Technology',
  size_range = '11-50',
  updated_at = now()
WHERE id = '31bc1d76-992f-42e8-ac9e-9dcaf0a53941';

-- Step 2: Update business_profiles for current user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM business_profiles WHERE user_id = '8cb9e87a-6c2b-451f-beaa-3a8b297e734e') THEN
    UPDATE business_profiles
    SET 
      company_name = 'Lansa',
      description = 'Lansa is a software company that gives young professionals something better to offer and connect them with businesses that needs them',
      website = 'https://www.lansa.online',
      industry = 'Technology',
      company_size = '11-50',
      organization_id = '31bc1d76-992f-42e8-ac9e-9dcaf0a53941',
      updated_at = now()
    WHERE user_id = '8cb9e87a-6c2b-451f-beaa-3a8b297e734e';
  ELSE
    INSERT INTO business_profiles (
      user_id,
      company_name,
      description,
      website,
      industry,
      company_size,
      organization_id,
      created_at,
      updated_at
    ) VALUES (
      '8cb9e87a-6c2b-451f-beaa-3a8b297e734e',
      'Lansa',
      'Lansa is a software company that gives young professionals something better to offer and connect them with businesses that needs them',
      'https://www.lansa.online',
      'Technology',
      '11-50',
      '31bc1d76-992f-42e8-ac9e-9dcaf0a53941',
      now(),
      now()
    );
  END IF;
END $$;

-- Step 3: Update business_onboarding_data for current user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM business_onboarding_data WHERE user_id = '8cb9e87a-6c2b-451f-beaa-3a8b297e734e') THEN
    UPDATE business_onboarding_data
    SET 
      company_name = 'Lansa',
      company_logo = 'https://hrmklkcdxkeyttboosgr.supabase.co/storage/v1/object/public/user-uploads/company-logos/24df69fd-6926-4909-a19b-b6eef70c0cfa/1761522640949-Lansa_Logo_black_and_White.jpg',
      business_services = 'Technology',
      business_size = '11-50',
      updated_at = now()
    WHERE user_id = '8cb9e87a-6c2b-451f-beaa-3a8b297e734e';
  ELSE
    INSERT INTO business_onboarding_data (
      user_id,
      company_name,
      company_logo,
      business_services,
      business_size,
      created_at,
      updated_at
    ) VALUES (
      '8cb9e87a-6c2b-451f-beaa-3a8b297e734e',
      'Lansa',
      'https://hrmklkcdxkeyttboosgr.supabase.co/storage/v1/object/public/user-uploads/company-logos/24df69fd-6926-4909-a19b-b6eef70c0cfa/1761522640949-Lansa_Logo_black_and_White.jpg',
      'Technology',
      '11-50',
      now(),
      now()
    );
  END IF;
END $$;

-- Step 4: Deactivate duplicate organizations (soft delete)
UPDATE organizations
SET 
  is_active = false,
  updated_at = now()
WHERE id IN (
  '6bc53a18-53ed-44ad-b6db-4e244ba4cb43',
  '14cd93cb-9731-42f9-95d4-61ea2fc3fbeb',
  'dbd1f312-1fcf-4d88-a1d3-249cc4b9f4d8',
  '5f70cad3-7422-4156-98ea-33a348859cac'
);

-- Step 5: Deactivate old memberships
UPDATE organization_memberships
SET 
  is_active = false,
  updated_at = now()
WHERE organization_id IN (
  '6bc53a18-53ed-44ad-b6db-4e244ba4cb43',
  '14cd93cb-9731-42f9-95d4-61ea2fc3fbeb',
  'dbd1f312-1fcf-4d88-a1d3-249cc4b9f4d8',
  '5f70cad3-7422-4156-98ea-33a348859cac'
);