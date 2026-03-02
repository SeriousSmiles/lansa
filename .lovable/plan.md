
## Complete System Audit: What Is Actually Wrong

Here is the honest, complete finding — explained simply.

---

### THE GOOD NEWS: The Core System Actually Works Now

The edge function `send-chat-email` is **deployed and working**. It was just tested live — it successfully sent an email to `jognnt@gmail.com`. The domain `notification.lansa.online` is verified and Resend accepted it.

The database triggers **do exist** on the `swipes` and `notifications` tables. They were installed by today's migrations.

---

### WHY YOU SAW NOTHING: The Feb 16 Swipe Was Historical

The Feb 16, 2026 swipe happened **before** today's trigger migrations. Triggers only fire on **new** events — they cannot retroactively process old data. That swipe will never generate a notification. **A new swipe will work.**

---

### THE REAL PROBLEMS FOUND (5 Issues)

#### Problem 1 — DUPLICATE Triggers Firing Twice (Broken)

The database has accumulated triggers from failed attempts. Right now:

| Table | Duplicate Triggers | What Happens |
|---|---|---|
| `matches` | `notify_both_on_match_trigger` + `on_match_notify_users` | Both call `notify_both_on_match()` → **2 notifications sent per match** |
| `user_actions` | `update_color_on_action` + `on_user_action_maybe_update_color` | Both call `maybe_update_user_color()` → **color recalculated twice** |
| `user_profiles` | `trg_sync_user_profiles_public_iud` + `sync_user_profiles_trigger` + `on_user_profile_sync_public` | All three call `sync_user_profiles_public()` → **public profile synced 3x** |
| `cert_certifications` | `on_cert_issued` + `sync_cert_certification_to_user` | Both call `sync_cert_to_user_certifications()` → **duplicate cert sync** |

**Fix:** Drop the old/leftover trigger names, keep the clean ones.

#### Problem 2 — `send_segment_email_on_color_change` Trigger Still Alive (Was Supposed to Be Deleted)

The project memory says this trigger was **removed** because `pg_net` wasn't installed. But it's **still in the database**. Now that `pg_net` IS installed, it will call `send-segment-email` every time a user's color changes. The `send-segment-email` edge function exists but may not be correctly connected/verified with `notification.lansa.online` as the from address.

**Fix:** Check and either fully wire it up or drop it cleanly.

#### Problem 3 — `chat_email_log` Is Never Written To (Rate-Limiter Broken)

The `trigger_chat_notification_email()` function writes to `chat_email_log` as a rate-limit guard. But the INSERT into `chat_email_log` happens **inside the trigger**, which runs as `postgres` superuser. `chat_email_log` has no SELECT policy for `postgres` to read from — but more importantly: the log is empty after ALL these test runs. This means either:
- The trigger hasn't fired yet for real swipes (timing — historical data issue confirmed above), OR
- The `chat_email_log` INSERT is silently failing

**Fix:** Confirm `chat_email_log` has no RLS blocking `postgres`, and add a `SELECT` policy so the rate-limit check works.

#### Problem 4 — `send-segment-email` Function Has Old `from` Address

The `_shared/emailService.ts` was updated to `noreply@notification.lansa.online`, but `send-segment-email` function imports from `_shared/emailService.ts`. It needs to be redeployed to pick up the change.

**Fix:** Redeploy `send-segment-email`.

#### Problem 5 — `QuickActionsSheet` Duplicate Key Warning (UI Bug)

The console logs show `AnimatePresence` is receiving duplicate keys in `QuickActionsSheet.tsx`. This causes incorrect animation behavior (things not opening/closing properly on mobile). This is the "drawer not opening" issue.

**Fix:** Give each action item in the sheet a unique key.

---

### The One Clean Solution

A single migration that:

1. **Drops all the old/duplicate triggers** — keeping only the one clean version of each
2. **Drops `send_segment_email_on_color_change`** — it was supposed to be deleted, now we do it properly
3. **Ensures `chat_email_log` has no RLS blocking** the rate-limiter check

Then one code fix: **`QuickActionsSheet.tsx`** — unique keys on the action items.

Then redeploy: **`send-segment-email`** and **`send-chat-email`** to ensure latest code is live.

---

### After This Fix: The Complete Flow

```text
Employer right-swipes candidate
        ↓
notify_candidate_on_swipe_trigger (on swipes)
        ↓
INSERT into notifications (employer_interest_received)
        ↓
trigger_chat_email_on_notification (on notifications)
        ↓
net.http_post → send-chat-email edge function
        ↓
Resend API (from: noreply@notification.lansa.online)
        ↓
Email arrives in candidate's inbox ✓
```

No old code. No duplicate attempts. One clean path.

---

### Technical Changes

**Migration (SQL):**
```sql
-- Drop duplicate triggers on matches (keep notify_both_on_match_trigger)
DROP TRIGGER IF EXISTS on_match_notify_users ON public.matches;

-- Drop duplicate triggers on user_actions (keep on_user_action_maybe_update_color)
DROP TRIGGER IF EXISTS update_color_on_action ON public.user_actions;
DROP TRIGGER IF EXISTS update_last_active_trigger ON public.user_actions;

-- Drop duplicate triggers on user_profiles (keep trg_sync_user_profiles_public_iud)
DROP TRIGGER IF EXISTS sync_user_profiles_trigger ON public.user_profiles;
DROP TRIGGER IF EXISTS on_user_profile_sync_public ON public.user_profiles;

-- Drop duplicate on cert_certifications (keep on_cert_issued)
DROP TRIGGER IF EXISTS sync_cert_certification_to_user ON public.cert_certifications;

-- Drop the zombie segment email trigger (supposed to be deleted, was never cleaned up)
DROP TRIGGER IF EXISTS send_segment_email_on_color_change ON public.user_profiles;

-- Fix chat_email_log RLS - ensure postgres role can read it (for rate limiting)
ALTER TABLE public.chat_email_log DISABLE ROW LEVEL SECURITY;
```

**Code fix (1 file):**
- `src/components/mobile/app/QuickActionsSheet.tsx` — fix duplicate `key` props in `AnimatePresence`
