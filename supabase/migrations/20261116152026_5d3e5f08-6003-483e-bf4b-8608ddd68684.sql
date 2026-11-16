ALTER POLICY catalogue_entries_select_business_active ON public.catalogue_entries USING (
 is_active = true AND public.has_role(auth.uid(), 'business')
 AND EXISTS (SELECT 1 FROM public.user_certifications uc WHERE uc.user_id = catalogue_entries.user_id AND uc.lansa_certified = true AND uc.verified = true)
);
COMMENT ON FUNCTION public.start_certification_exam(public.exam_sector) IS 'Intentional authenticated SECURITY DEFINER API: validates auth.uid() and completed sector payment, assigns bounded question IDs server-side, and inserts only the caller-owned session. Anonymous execution and direct client session insertion/question mutation are revoked. Fixed search_path=public.';