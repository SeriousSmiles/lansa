
-- Drop all public schema triggers safely before recreating
DROP TRIGGER IF EXISTS notify_candidate_on_swipe_trigger ON public.swipes;
DROP TRIGGER IF EXISTS on_swipe_create_match ON public.swipes;
DROP TRIGGER IF EXISTS on_match_create_thread ON public.matches;
DROP TRIGGER IF EXISTS notify_both_on_match_trigger ON public.matches;
DROP TRIGGER IF EXISTS trigger_chat_email_on_notification ON public.notifications;
DROP TRIGGER IF EXISTS trg_sync_user_profiles_public_iud ON public.user_profiles;
DROP TRIGGER IF EXISTS trg_segment_change_email ON public.user_profiles;
DROP TRIGGER IF EXISTS on_user_action_update_last_active ON public.user_actions;
DROP TRIGGER IF EXISTS on_user_action_maybe_update_color ON public.user_actions;
DROP TRIGGER IF EXISTS on_cert_issued ON public.cert_certifications;
DROP TRIGGER IF EXISTS on_connection_request_accepted_trigger ON public.connection_requests;
DROP TRIGGER IF EXISTS on_job_application_accepted_trigger ON public.job_applications_v2;
DROP TRIGGER IF EXISTS on_pricing_wall_paid ON public.pricing_wall_events;
DROP TRIGGER IF EXISTS on_user_answers_assign_role ON public.user_answers;
DROP TRIGGER IF EXISTS tsvector_update_job_listings ON public.job_listings_v2;
DROP TRIGGER IF EXISTS update_resume_designs_updated_at ON public.resume_designs;
DROP TRIGGER IF EXISTS update_resume_sections_updated_at ON public.resume_sections;
DROP TRIGGER IF EXISTS update_product_updates_updated_at ON public.product_updates;
DROP TRIGGER IF EXISTS sync_company_logo_trigger ON public.business_onboarding_data;

-- ============================================================
-- RECREATE ALL CRITICAL TRIGGERS (ONE CLEAN VERSION EACH)
-- ============================================================

-- 1. Swipe right → notify candidate (employer interest)
CREATE TRIGGER notify_candidate_on_swipe_trigger
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.notify_candidate_on_employer_swipe();

-- 2. Swipe right (mutual) → create match
CREATE TRIGGER on_swipe_create_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.create_match_if_mutual();

-- 3. New match → create chat thread
CREATE TRIGGER on_match_create_thread
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.create_thread_on_match();

-- 4. New match → notify both users
CREATE TRIGGER notify_both_on_match_trigger
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.notify_both_on_match();

-- 5. New notification → trigger email via edge function
CREATE TRIGGER trigger_chat_email_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_notification_email();

-- 6. User profile change → sync public profile
CREATE TRIGGER trg_sync_user_profiles_public_iud
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_profiles_public();

-- 7. User profile color_auto change → send segment change email
CREATE TRIGGER trg_segment_change_email
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_segment_change_email();

-- 8. User action → update last_active_at on profile
CREATE TRIGGER on_user_action_update_last_active
  AFTER INSERT ON public.user_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();

-- 9. User action → maybe recalculate color segment
CREATE TRIGGER on_user_action_maybe_update_color
  AFTER INSERT ON public.user_actions
  FOR EACH ROW EXECUTE FUNCTION public.maybe_update_user_color();

-- 10. Cert issued → sync to user_certifications + mark certified
CREATE TRIGGER on_cert_issued
  AFTER INSERT ON public.cert_certifications
  FOR EACH ROW EXECUTE FUNCTION public.sync_cert_to_user_certifications();

-- 11. Connection request accepted → create thread + notifications
CREATE TRIGGER on_connection_request_accepted_trigger
  AFTER UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_connection_request_accepted();

-- 12. Job application accepted → create thread + notifications
CREATE TRIGGER on_job_application_accepted_trigger
  AFTER UPDATE ON public.job_applications_v2
  FOR EACH ROW EXECUTE FUNCTION public.on_job_application_accepted();

-- 13. Pricing wall paid for certification → mark user certified
CREATE TRIGGER on_pricing_wall_paid
  AFTER INSERT ON public.pricing_wall_events
  FOR EACH ROW EXECUTE FUNCTION public.mark_certified();

-- 14. User answers updated → assign employer role if needed
CREATE TRIGGER on_user_answers_assign_role
  AFTER INSERT OR UPDATE ON public.user_answers
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_on_onboarding();

-- 15. Job listings → update search tsvector
CREATE TRIGGER tsvector_update_job_listings
  BEFORE INSERT OR UPDATE ON public.job_listings_v2
  FOR EACH ROW EXECUTE FUNCTION public.job_listings_tsvector_trigger();

-- 16. Resume designs → update updated_at
CREATE TRIGGER update_resume_designs_updated_at
  BEFORE UPDATE ON public.resume_designs
  FOR EACH ROW EXECUTE FUNCTION public.update_resume_designs_updated_at();

-- 17. Resume sections → update updated_at
CREATE TRIGGER update_resume_sections_updated_at
  BEFORE UPDATE ON public.resume_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_resume_sections_updated_at();

-- 18. Product updates → update updated_at
CREATE TRIGGER update_product_updates_updated_at
  BEFORE UPDATE ON public.product_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_product_updates_updated_at();

-- 19. Business onboarding → sync company logo
CREATE TRIGGER sync_company_logo_trigger
  AFTER INSERT OR UPDATE OF company_logo, company_name ON public.business_onboarding_data
  FOR EACH ROW EXECUTE FUNCTION public.sync_company_logo();
