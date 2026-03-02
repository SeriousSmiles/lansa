
-- Fix Casey Doran: create missing user_certifications record and update user_profiles
-- user_id: 3f84cc75-050a-4519-8cb7-ecbd156d0f54
-- cert_result_id: ffdc4afd-9d40-4c5c-8f67-b6e523fa94c9 (Technical, score 84, pass=true)

INSERT INTO public.user_certifications (
  user_id,
  lansa_certified,
  verified,
  assessment_score,
  certified_at,
  updated_at
)
VALUES (
  '3f84cc75-050a-4519-8cb7-ecbd156d0f54',
  true,
  true,
  84,
  '2025-12-16 02:28:18.969714+00',
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  lansa_certified = true,
  verified = true,
  assessment_score = 84,
  certified_at = '2025-12-16 02:28:18.969714+00',
  updated_at = now();

-- Also ensure user_profiles reflects certification
UPDATE public.user_profiles
SET certified = true,
    certification_paid_at = COALESCE(certification_paid_at, '2025-12-16 02:28:18.969714+00'),
    updated_at = now()
WHERE user_id = '3f84cc75-050a-4519-8cb7-ecbd156d0f54';
