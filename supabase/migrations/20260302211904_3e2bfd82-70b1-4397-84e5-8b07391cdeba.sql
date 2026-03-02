
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- swipes triggers
DROP TRIGGER IF EXISTS notify_candidate_on_swipe_trigger ON public.swipes;
CREATE TRIGGER notify_candidate_on_swipe_trigger
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.notify_candidate_on_employer_swipe();

DROP TRIGGER IF EXISTS on_swipe_create_match ON public.swipes;
CREATE TRIGGER on_swipe_create_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.create_match_if_mutual();

-- matches triggers
DROP TRIGGER IF EXISTS on_match_create_thread ON public.matches;
CREATE TRIGGER on_match_create_thread
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.create_thread_on_match();

DROP TRIGGER IF EXISTS on_match_notify_users ON public.matches;
CREATE TRIGGER on_match_notify_users
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.notify_both_on_match();

-- THE CRITICAL EMAIL TRIGGER
DROP TRIGGER IF EXISTS trigger_chat_email_on_notification ON public.notifications;
CREATE TRIGGER trigger_chat_email_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_notification_email();

-- user_profiles triggers
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.user_profiles;
CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_on_onboarding();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_user_profile_sync_public ON public.user_profiles;
CREATE TRIGGER on_user_profile_sync_public
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_profiles_public();

-- Supporting triggers
DROP TRIGGER IF EXISTS on_cert_issued ON public.cert_certifications;
CREATE TRIGGER on_cert_issued
  AFTER INSERT ON public.cert_certifications
  FOR EACH ROW EXECUTE FUNCTION public.sync_cert_to_user_certifications();

DROP TRIGGER IF EXISTS on_new_message_update_last_active ON public.chat_messages;
CREATE TRIGGER on_new_message_update_last_active
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();

DROP TRIGGER IF EXISTS on_user_action_maybe_update_color ON public.user_actions;
CREATE TRIGGER on_user_action_maybe_update_color
  AFTER INSERT ON public.user_actions
  FOR EACH ROW EXECUTE FUNCTION public.maybe_update_user_color();
