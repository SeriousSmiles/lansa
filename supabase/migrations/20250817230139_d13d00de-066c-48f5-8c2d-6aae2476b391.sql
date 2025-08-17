-- Find and certify the test user jognnt@gmail.com
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Find the user ID for jognnt@gmail.com
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'jognnt@gmail.com';
    
    IF test_user_id IS NOT NULL THEN
        -- Insert or update certification record
        INSERT INTO public.user_certifications (
            user_id, 
            lansa_certified, 
            certified_at, 
            assessment_score,
            verified,
            created_at,
            updated_at
        )
        VALUES (
            test_user_id,
            true,
            now(),
            95, -- High test score
            true,
            now(),
            now()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            lansa_certified = true,
            certified_at = now(),
            assessment_score = 95,
            verified = true,
            updated_at = now();
            
        -- Also create a catalogue entry to list them online
        INSERT INTO public.catalogue_entries (
            user_id,
            is_active,
            job_ready,
            internship_ready,
            location,
            availability,
            created_at,
            updated_at
        )
        VALUES (
            test_user_id,
            true,
            true,
            true,
            'Remote',
            'Full-time',
            now(),
            now()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
            is_active = true,
            job_ready = true,
            internship_ready = true,
            updated_at = now();
            
        RAISE NOTICE 'Successfully certified user jognnt@gmail.com and listed them online';
    ELSE
        RAISE NOTICE 'User jognnt@gmail.com not found in auth.users table';
    END IF;
END $$;