
-- Part 1: Add missing INSERT RLS policy on cert_certifications
CREATE POLICY "Users can insert their own certifications"
ON public.cert_certifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Part 2: Backfill cert_certifications for all users who passed but have no cert record
-- The trigger sync_cert_to_user_certifications will fire automatically for each inserted row,
-- cascading to user_certifications and user_profiles
INSERT INTO public.cert_certifications (user_id, sector, level, result_id, verification_code, date_issued)
SELECT 
  cr.user_id,
  cr.sector,
  CASE WHEN cr.high_performer = true THEN 'high_performer'::certification_level ELSE 'standard'::certification_level END,
  cr.id,
  public.generate_cert_verification_code(),
  cr.created_at
FROM public.cert_results cr
WHERE cr.pass_fail = true
AND NOT EXISTS (
  SELECT 1 FROM public.cert_certifications cc WHERE cc.result_id = cr.id
);
