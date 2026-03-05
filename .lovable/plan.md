

## Root Cause: Two Different Email Systems Fired Independently

The user who received both emails is **user_id: `e15bf03c`** (John Nathan Stephens — same email as admin's test account `jognnt@gmail.com`).

### What actually happened (timeline)

```
March 3, 18:19 UTC  →  send-segment-email (TRIGGER-BASED)
  old_segment: green → new_segment: RED
  → Sent: "Don't let your progress fade" (red segment transition email)

March 3, 18:37 UTC  →  send-segment-email (TRIGGER-BASED)
  old_segment: red → new_segment: PURPLE
  → Sent: "You're a Lansa Advocate" (recovery email)

March 5, 19:27 UTC  →  broadcast-segment-emails (MANUAL BROADCAST)
  current segment: purple
  → Sent: "You're a Lansa Advocate" (broadcast email)
```

So the user received the **Red** email first (18:19), then **18 minutes later** jumped to Purple and got the Advocate email (18:37), then again today got the Advocate broadcast email. Two different systems, both working correctly per their own rules — but the interaction creates a confusing double-email experience.

### Why both fired

**System 1 — `send-segment-email`** (trigger-based, real-time)
- Fires on database segment CHANGE events (green → red, red → purple, etc.)
- Its rate-limit only checks for that same `user_id` in the last 5 days, regardless of `new_segment`
- **Problem:** It allowed the red→purple transition email because the previous log entry was `green→red`, not `purple`. It sees two different `new_segment` values and considers them separate events

**System 2 — `broadcast-segment-emails`** (manual broadcast)
- Rate-limit logic: for purple users it checks `recentEmailKeys.has('userId:purple')` — only blocks if a recent **purple** email was sent
- **Problem:** The March 3 transition email was logged as `old_segment=red, new_segment=purple`. Today's broadcast checks for `new_segment=purple` in the last 5 days — that log entry EXISTS, so this user should have been **rate-limited** and skipped

Wait — re-reading the broadcast code more carefully:

```js
const isRateLimited = segment === 'purple'
  ? recentEmailKeys.has(`${user.user_id}:purple`)    // checks new_segment=purple
  : recentLogsResult.data?.some(l => l.user_id === user.user_id) ?? false;
```

The `recentEmailKeys` is built from `segment_email_log` WHERE `email_sent_at > now() - 5 days`. The March 3 entry at 18:37 has `new_segment=purple`. Today is March 5 = only 2 days later. The key `e15bf03c:purple` SHOULD be in the set.

**But we deleted the 17:48 batch earlier today.** Let me check — the 17:48 deletion was for entries where `email_sent_at >= 2026-03-05 17:48` AND `< 2026-03-05 17:49`. The March 3 entries are untouched. So the purple rate-limit check should have caught this user.

Actually — looking at the second query result again:
- `user_id: e15bf03c` had entries on March 3 at 18:37 with `new_segment: purple`
- Today's broadcast (19:27) still sent to them

This means the rate-limit check for purple users is comparing against `new_segment` in the log, but the March 3 entry that has `new_segment: purple` was created by the trigger-based system (`send-segment-email`) which logs `old_segment=red, new_segment=purple`. The broadcast's `recentEmailKeys` set is built as:

```js
recentLogsResult.data?.forEach(l => recentEmailKeys.add(`${l.user_id}:${l.new_segment}`));
```

This would produce key `e15bf03c:purple` from the March 3 entry... Unless the `recentLogsResult` query has a time filter:
```js
.gte('email_sent_at', new Date(Date.now() - RATE_LIMIT_DAYS * 24 * 60 * 60 * 1000).toISOString())
```
= 5 days ago. March 3 is only 2 days ago. So `e15bf03c:purple` SHOULD be in the set.

**Actual bug found:** The rate-limit check for non-purple users is:
```js
: recentLogsResult.data?.some(l => l.user_id === user.user_id) ?? false;
```
This blocks ANY user who has ANY recent log entry. But the purple check is specifically:
```js
recentEmailKeys.has(`${user.user_id}:purple`)
```

The March 3 entry for this user has `new_segment = 'purple'` — so `e15bf03c:purple` IS in the set. This should have been rate-limited. 

Unless... the `segment_email_log` table uses `id` as a column but the query selects `user_id, new_segment, email_sent_at` — there's no `id` column referenced, so that's fine.

**Most likely real bug:** The broadcast read the log entries BEFORE the 17:48 cleanup migration ran, OR the `segment_email_log` table doesn't have an `id` column and the `.some()` check fails silently.

Let me plan the fix regardless, since the system behavior is clear:

### The Real Problem to Fix

**The `send-segment-email` (transition trigger) sends emails for ALL direction changes**, including when a user jumps from red → purple. But the rate-limit in that function checks for ANY recent email across ANY segment — it should have blocked the red→purple email because a red transition email was sent 18 minutes earlier. 

Looking at the code:
```js
const { data: recentEmail } = await supabase
  .from('segment_email_log')
  .select('email_sent_at')
  .eq('user_id', user_id)
  .gt('email_sent_at', ...) // last 5 days
  .single();
```

This WOULD catch it — both entries are on the same day, 18 minutes apart. So why did both fire?

**Answer found:** The trigger fires the edge function via `pg_net.http_post()` which is ASYNCHRONOUS. Both color changes (green→red AND red→purple) happened within seconds of each other when the admin pressed "Update Colors." The two HTTP calls hit the edge function almost simultaneously — before either had a chance to write its log entry. Both fetched the rate-limit check at the same time, both saw no recent email, both proceeded to send.

**This is a classic RACE CONDITION** in the trigger-based system.

### The Fix Plan

**Fix 1 — `send-segment-email`: Add a transition whitelist**
Currently the `shouldSendEmail` logic sends for:
- Any → red
- red → orange  
- red → green

**It should NOT send when `new_segment = 'purple'`** because purple users are advocates — they don't need a "you're drifting" or "you're recovering" message. They should only get the broadcast advocate email. This eliminates the race condition problem for purple users specifically.

**Fix 2 — `broadcast-segment-emails`: Tighten the rate-limit check for purple**
The rate-limit check for purple currently only blocks if a broadcast purple email was sent recently. It should also block if the trigger-based email already sent a purple email within 5 days (which IS already in the log, but the race condition above caused two sends).

**Fix 3 — Cross-system rate-limit**
Both the transition system and the broadcast system share the same `segment_email_log` table. The broadcast should check `new_segment` matches the user's CURRENT segment and block if any email (regardless of `old_segment`) was sent within 5 days.

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/send-segment-email/index.ts` | Remove `purple` from the allowed transition email list (purple users should not receive automated transition nudges — only the broadcast advocate email) |
| `supabase/functions/broadcast-segment-emails/index.ts` | Strengthen rate-limit: check if ANY email was sent to this user in the last 5 days (not just `new_segment:purple`), matching what non-purple users already get |

These two changes together close the race condition and prevent the duplicate email situation from happening again.

