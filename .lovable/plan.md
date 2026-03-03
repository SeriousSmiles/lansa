
## Root Cause Analysis

### Bug 1 — `match_created` email: "your match" fallback fires due to race condition

**Flow**: `notify_both_on_match` trigger fires → inserts notification → `trigger_chat_notification_email` trigger fires immediately → calls `send-chat-email` edge function → function calls `resolveOtherPartyName(threadId)`.

**Problem**: The notification already has `metadata` containing `other_user_id` from the trigger, but `send-chat-email` IGNORES the metadata entirely. Instead it tries to re-derive the other party from the thread's `participant_ids`. If the thread doesn't exist yet (race condition between `create_thread_on_match` and `notify_both_on_match`) → thread query returns null → fallback `'your match'` is used in subject line.

**Fix**: The `notify_both_on_match` trigger already stores `other_user_id` in the notification `metadata` field. Pass `metadata` from the DB trigger to the edge function, and use `metadata.other_user_id` directly to look up the name — no thread dependency needed.

### Bug 2 — `employer_interest_received` and `employer_nudge_received`: no employer name

The `EmployerInterestEmailData` interface has no `employerName` field. The email body says "an employer on Lansa liked your profile" — completely anonymous. The notification metadata contains the employer's `user_id` (from the swipe trigger), but it's never used.

**Fix**: Pass employer name from notification metadata in the edge function for these two types.

### RLS Check

- `matches` table: ✅ RLS enabled, SELECT policy scoped to participants only
- `chat_threads` table: ✅ RLS enabled, `is_thread_participant` check
- `notifications` table: ✅ RLS enabled, users see only their own
- `chat_email_log` table: ⚠️ RLS **disabled** (intentional per memory — postgres superuser needs access for rate-limit checks, this is documented as intentional)
- The `trigger_chat_notification_email` and `notify_both_on_match` both use `SECURITY DEFINER` — correct, they need to read across users

No RLS gaps to fix for this feature.

## Changes Needed

### 1. DB trigger — `trigger_chat_notification_email`
Pass `metadata` in the `net.http_post` body so the edge function can use `other_user_id` directly.

```sql
body := jsonb_build_object(
  'user_id', NEW.user_id,
  'notification_type', NEW.type,
  'title', NEW.title,
  'message', NEW.message,
  'action_url', NEW.action_url,
  'metadata', NEW.metadata  -- ADD THIS
)
```

### 2. Edge function `send-chat-email/index.ts`

**For `match_created`**: Read `metadata.other_user_id` from payload first, then look up their name directly by `user_id`. No thread lookup needed. Only fall back to thread lookup if metadata is missing.

**For `employer_interest_received` and `employer_nudge_received`**: Read `metadata.employer_id` or `metadata.swiper_id` from payload, look up the employer/org name, pass it to email templates.

### 3. Email templates `_shared/emailTemplates.ts`

**`EmployerInterestEmailData`**: Add optional `employerName?: string` field.

Update body copy:
- Interest: `"An employer on Lansa liked your profile"` → `"<strong>EmployerName</strong> liked your profile on Lansa"` (when name available)
- Nudge: same treatment with Super Interest copy

**`generateMatchCreatedEmail`**: Subject and body already use `data.otherPartyName` correctly — no template change needed, just the data pipeline.

### 4. Check swipe trigger for employer metadata

Need to verify the swipe notification trigger stores the employer's `user_id` in metadata so the edge function can use it.

## Files to Change

| File | Change |
|---|---|
| DB migration | Pass `metadata` column in `trigger_chat_notification_email` net.http_post body |
| `send-chat-email/index.ts` | Use `metadata.other_user_id` for match names; use `metadata` for employer names |
| `_shared/emailTemplates.ts` | Add `employerName?` to interest/nudge interfaces; update copy |
