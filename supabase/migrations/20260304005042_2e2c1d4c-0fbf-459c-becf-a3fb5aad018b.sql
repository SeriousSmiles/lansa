
INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
SELECT DISTINCT ON (jl.created_by, ja.job_id)
  jl.created_by AS user_id,
  'job_application_received'::notification_type AS type,
  '📩 New Application Received' AS title,
  COALESCE(up_applicant.name, 'A candidate') || ' applied for "' || jl.title || '"' AS message,
  '/dashboard' AS action_url,
  jsonb_build_object(
    'applicant_user_id', ja.applicant_user_id,
    'job_id', ja.job_id,
    'job_title', jl.title,
    'application_id', ja.id
  ) AS metadata
FROM job_applications_v2 ja
JOIN job_listings_v2 jl ON jl.id = ja.job_id
LEFT JOIN user_profiles up_applicant ON up_applicant.user_id = ja.applicant_user_id
WHERE ja.status = 'pending'
  AND jl.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = jl.created_by
      AND n.type = 'job_application_received'
      AND n.metadata->>'application_id' = ja.id::text
  )
ORDER BY jl.created_by, ja.job_id, ja.created_at DESC;
