
-- Remove any prior schedule with the same name (idempotent)
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'process-profile-nudges';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END$$;

SELECT cron.schedule(
  'process-profile-nudges',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hrmklkcdxkeyttboosgr.supabase.co/functions/v1/process-profile-nudges',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWtsa2NkeGtleXR0Ym9vc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzQyNzQsImV4cCI6MjA2MjU1MDI3NH0.7X1DgS3CD8op6xcqfZhvQkoMhXs_qeKrrRMK1vqoGKs"}'::jsonb,
    body := jsonb_build_object('cron', true, 'at', now())
  );
  $$
);
