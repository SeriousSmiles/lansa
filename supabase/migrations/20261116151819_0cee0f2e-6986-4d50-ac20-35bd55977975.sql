BEGIN;
ALTER TABLE public.chat_email_log ENABLE ROW LEVEL SECURITY;

ALTER POLICY companies_insert ON public.companies WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR (
    (public.has_role(auth.uid(), 'employer') OR public.has_role(auth.uid(), 'business'))
    AND EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.user_id = auth.uid() AND btrim(bp.company_name) = btrim(companies.name))
  )
);
-- Company directory fields are intentionally shared for job listings.
ALTER POLICY companies_read ON public.companies USING (auth.uid() IS NOT NULL AND name IS NOT NULL);

ALTER POLICY catalogue_entries_select_authenticated ON public.catalogue_entries USING (
 user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR (
 is_active AND (public.has_role(auth.uid(), 'employer') OR public.has_role(auth.uid(), 'business'))
 AND EXISTS (SELECT 1 FROM public.user_certifications uc WHERE uc.user_id = catalogue_entries.user_id AND uc.lansa_certified = true AND uc.verified = true)
 )
);
ALTER POLICY "Anyone authenticated can view mentor profiles" ON public.mentor_profiles USING (
 user_id = auth.uid() OR approval_status = 'approved' OR public.has_role(auth.uid(), 'admin')
);
DROP POLICY "Users can create organizations" ON public.organizations;
-- Existing authenticated SECURITY DEFINER create_organization_with_owner performs the atomic write.

ALTER POLICY "Anyone can view user uploads" ON storage.objects TO authenticated USING (
 bucket_id = 'user-uploads' AND (owner_id = auth.uid()::text OR (storage.foldername(name))[2] = auth.uid()::text OR (
 (storage.foldername(name))[1] = 'company-logos' AND EXISTS (SELECT 1 FROM public.organization_memberships om WHERE om.organization_id::text = (storage.foldername(objects.name))[2] AND om.user_id = auth.uid() AND om.is_active)
 ))
);
DROP POLICY "Public Access to user-uploads" ON storage.objects;
DROP POLICY "Public can view user uploads" ON storage.objects;
DROP POLICY "Employers can view company logos" ON storage.objects;
DROP POLICY "Anyone can view job images" ON storage.objects;
DROP POLICY user_uploads_select_public ON storage.objects;
ALTER POLICY "Public can view product update images" ON storage.objects TO authenticated USING (
 bucket_id = 'product-updates' AND (owner_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);
ALTER POLICY "Anyone can view content videos" ON storage.objects TO authenticated USING (
 bucket_id = 'content-videos' AND (owner_id = auth.uid()::text OR (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);
ALTER POLICY "Authenticated users can upload images" ON storage.objects TO authenticated WITH CHECK (
 bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = 'profile-images' AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Assign the question subset on the server, never trust client-supplied question IDs.
CREATE OR REPLACE FUNCTION public.start_certification_exam(p_sector public.exam_sector)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
 v_user uuid := auth.uid();
 v_ids jsonb;
 v_session public.cert_sessions;
 v_questions jsonb;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.user_id = v_user AND p.payment_type = 'certification_exam' AND p.status = 'completed' AND p.metadata->>'sector' = p_sector::text) THEN
   RAISE EXCEPTION 'Complete payment for this exam before starting';
 END IF;
 SELECT jsonb_agg(id ORDER BY random()) INTO v_ids FROM (
   SELECT id, category, row_number() OVER (PARTITION BY category ORDER BY random()) AS position
   FROM public.cert_questions WHERE sector = p_sector AND COALESCE(question_type, 'mcq') <> 'written'
 ) q WHERE position <= CASE WHEN category IN ('mindset','applied_thinking') THEN 4 ELSE 3 END;
 IF v_ids IS NULL THEN RAISE EXCEPTION 'No questions available for this sector'; END IF;
 INSERT INTO public.cert_sessions(user_id, sector, selected_questions, status)
 VALUES(v_user, p_sector, v_ids, 'in_progress') RETURNING * INTO v_session;
 SELECT jsonb_agg(to_jsonb(q) ORDER BY selected.ordinality) INTO v_questions
 FROM jsonb_array_elements_text(v_ids) WITH ORDINALITY selected(id, ordinality)
 JOIN public.cert_questions q ON q.id::text = selected.id;
 RETURN jsonb_build_object('session_id', v_session.id, 'questions', v_questions);
END;
$$;
REVOKE ALL ON FUNCTION public.start_certification_exam(public.exam_sector) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_certification_exam(public.exam_sector) TO authenticated, service_role;
-- Users can still complete a session, but cannot choose or change its questions.
REVOKE INSERT, UPDATE ON public.cert_sessions FROM PUBLIC, anon, authenticated;
GRANT UPDATE(status, end_time) ON public.cert_sessions TO authenticated;
ALTER POLICY "Authenticated users can view questions" ON public.cert_questions TO authenticated USING (
 public.has_role(auth.uid(), 'admin') OR EXISTS (
 SELECT 1 FROM public.cert_sessions s WHERE s.user_id = auth.uid() AND s.sector = cert_questions.sector AND s.selected_questions @> jsonb_build_array(cert_questions.id::text)
 )
);
COMMIT;