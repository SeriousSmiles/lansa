UPDATE public.notifications
SET action_url = '/employer-dashboard?tab=jobs&jobId=' || (metadata->>'job_id')
WHERE type = 'job_application_received'
  AND metadata->>'job_id' IS NOT NULL
  AND action_url LIKE '/dashboard/jobs/%';