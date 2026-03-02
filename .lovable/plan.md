
## Root Cause: All Database Triggers Are Missing

The full notification and email pipeline depends on three triggers that are not present in the database:

```text
Swipe (right) → [TRIGGER: notify_candidate_on_employer_swipe] → notifications table
                                                                       ↓
                                                        [TRIGGER: trigger_chat_notification_email]
                                                                       ↓
                                                             send-chat-email Edge Function
                                                                       ↓
                                                                Resend API → Inbox
```

Evidence:
- `information_schema.triggers` returns zero rows
- The `notifications` table has no rows newer than October 2025
- The `chat_email_log` table is completely empty
- Right swipes exist in `swipes` (direction: right) but produced no notifications

All DB functions exist and are correct. The issue is exclusively that the CREATE TRIGGER statements were never persisted.

---

## What Will Be Created

A single database migration that creates all missing triggers:

### 1. On `auth.users` (new user profile)
- `on_auth_user_created` → calls `handle_new_user()` — creates user_profiles row on signup

### 2. On `swipes`
- `notify_candidate_on_swipe_trigger` AFTER INSERT → calls `notify_candidate_on_employer_swipe()` — creates the `employer_interest_received` / `employer_nudge_received` notification when an employer right-swipes or nudges
- `on_swipe_create_match` AFTER INSERT → calls `create_match_if_mutual()` — creates a match when both parties swiped right

### 3. On `matches`
- `on_match_create_thread` AFTER INSERT → calls `create_thread_on_match()` — creates the chat thread
- `on_match_notify_users` AFTER INSERT → calls `notify_both_on_match()` — creates `match_created` notifications for both users

### 4. On `notifications`
- `trigger_chat_email_on_notification` AFTER INSERT → calls `trigger_chat_notification_email()` — sends the HTTP call to the `send-chat-email` edge function via `pg_net`

### 5. Supporting triggers (already had these but need re-creation)
- `on_user_profile_updated` on `user_profiles` → `assign_role_on_onboarding()`
- `update_user_profiles_updated_at` on `user_profiles` → `update_updated_at_column()`
- `on_cert_issued` on `cert_certifications` → `sync_cert_to_user_certifications()`
- `on_wall_entry_mark_certified` on `wall_entries` → `mark_certified()`
- `on_new_message_update_last_active` on `chat_messages` → `update_user_last_active()`
- `on_user_action_maybe_update_color` on `user_actions` → `maybe_update_user_color()`
- `on_user_profile_sync_public` on `user_profiles` → `sync_user_profiles_public()`

---

## Technical Details

The migration will use `CREATE TRIGGER IF NOT EXISTS` (or `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`) so it is safe to re-run without duplicating anything.

The critical path for emails is:

```sql
-- Step 1: swipe triggers notification
CREATE TRIGGER notify_candidate_on_swipe_trigger
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.notify_candidate_on_employer_swipe();

-- Step 2: notification triggers email edge function  
CREATE TRIGGER trigger_chat_email_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_notification_email();
```

No code changes are needed. No edge function changes needed. The `lansa.online` domain and `RESEND_API_KEY` are already configured correctly.
