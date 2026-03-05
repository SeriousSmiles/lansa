
-- Remove the 17:48 batch of transition log entries that are blocking 125 users from receiving emails.
-- The 14 entries from 18:55 (confirmed delivered) are preserved.
DELETE FROM public.segment_email_log
WHERE email_sent_at::timestamptz >= '2026-03-05 17:48:00+00'
  AND email_sent_at::timestamptz < '2026-03-05 17:49:00+00';
