
-- Remove duplicate triggers (keep the cleaner-named versions)
DROP TRIGGER IF EXISTS on_match_notify_users ON public.matches;
DROP TRIGGER IF EXISTS tsv_jlv2 ON public.job_listings_v2;
DROP TRIGGER IF EXISTS trg_wall_paid ON public.pricing_wall_events;
DROP TRIGGER IF EXISTS on_connection_request_accepted ON public.connection_requests;
DROP TRIGGER IF EXISTS on_job_application_accepted ON public.job_applications_v2;
DROP TRIGGER IF EXISTS auto_assign_employer_role ON public.user_answers;
DROP TRIGGER IF EXISTS on_user_profile_sync_public ON public.user_profiles;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.user_profiles;
DROP TRIGGER IF EXISTS product_updates_updated_at ON public.product_updates;
DROP TRIGGER IF EXISTS trigger_update_resume_designs_updated_at ON public.resume_designs;
DROP TRIGGER IF EXISTS trigger_update_resume_templates_updated_at ON public.resume_templates;
