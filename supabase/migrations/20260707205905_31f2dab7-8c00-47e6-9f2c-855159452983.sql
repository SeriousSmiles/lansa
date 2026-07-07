
CREATE TABLE public.resume_print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  format TEXT NOT NULL DEFAULT 'pdf',
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resume_print_jobs TO authenticated;
GRANT ALL ON public.resume_print_jobs TO service_role;

ALTER TABLE public.resume_print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own print jobs"
ON public.resume_print_jobs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX resume_print_jobs_token_hash_idx ON public.resume_print_jobs (token_hash);
CREATE INDEX resume_print_jobs_expires_idx ON public.resume_print_jobs (expires_at);

CREATE POLICY "users read own resume exports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume-exports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
