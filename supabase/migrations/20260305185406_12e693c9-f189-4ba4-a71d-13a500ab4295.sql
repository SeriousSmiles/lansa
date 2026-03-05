-- Clear failed broadcast log entries from the last 5 days so users aren't incorrectly rate-limited
-- These emails were blocked by Resend and never delivered
DELETE FROM public.segment_email_log
WHERE email_sent_at > now() - INTERVAL '5 days'
  AND old_segment = new_segment; -- only removes broadcast-type entries (same segment), not real transition emails
