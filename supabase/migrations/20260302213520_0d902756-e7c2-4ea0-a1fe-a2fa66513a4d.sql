
-- =====================================================
-- CLEAN TRIGGER CONSOLIDATION
-- Drop all duplicate/zombie triggers, keep one clean version per table
-- =====================================================

-- matches: drop duplicate (keep on_match_notify_users from latest migration)
DROP TRIGGER IF EXISTS notify_both_on_match_trigger ON public.matches;

-- user_actions: drop duplicate (keep on_user_action_maybe_update_color)
DROP TRIGGER IF EXISTS update_color_on_action ON public.user_actions;
DROP TRIGGER IF EXISTS update_last_active_trigger ON public.user_actions;

-- user_profiles: drop duplicates (keep on_user_profile_sync_public from latest migration)
DROP TRIGGER IF EXISTS trg_sync_user_profiles_public_iud ON public.user_profiles;
DROP TRIGGER IF EXISTS sync_user_profiles_trigger ON public.user_profiles;

-- cert_certifications: drop duplicate (keep on_cert_issued)
DROP TRIGGER IF EXISTS sync_cert_certification_to_user ON public.cert_certifications;

-- Zombie segment email trigger - drop cleanly (pg_net now enabled but send-segment-email is not wired)
DROP TRIGGER IF EXISTS send_segment_email_on_color_change ON public.user_profiles;

-- Fix chat_email_log RLS so postgres role (trigger executor) can read it for rate limiting
ALTER TABLE public.chat_email_log DISABLE ROW LEVEL SECURITY;
