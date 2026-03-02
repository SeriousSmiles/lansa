
## Full Swipe Notification System + "Who's Interested" Section

### Current State Summary

**What exists and works:**
- `swipes` table with `direction`, `swiper_user_id`, `target_user_id`, `context`
- `notifications` table with `notification_type` enum
- `create_match_if_mutual()` DB trigger fires on swipe INSERT — creates a match row
- `create_thread_on_match()` DB trigger fires on match INSERT — creates chat thread
- `trigger_chat_notification_email()` DB trigger fires on notification INSERT for `chat_request_received`, `chat_request_accepted`, `message_received` — calls `send-chat-email` edge function via `pg_net`
- `CandidateBrowseTab.tsx` (desktop) calls `notificationService.createNotification()` client-side when employer swipes right/nudge — but uses `match_created` type (wrong intent, it's not a match yet)
- `candidateDiscoveryService.swipeCandidate()` (mobile) does NOT send any notification

**What's missing:**
1. No server-side DB trigger to notify candidate when employer swipes right/nudge (relying on client-side is unreliable)
2. No `match_created` notification with deep link to chat thread for both parties
3. Email trigger only handles 3 types — `employer_interest_received` and `employer_nudge_received` types don't exist
4. No "Who's Interested" UI for candidates to see employers who swiped right on them
5. `notification_type` enum missing `employer_interest_received` and `employer_nudge_received` values

---

### What Will Be Built

#### Part 1 — DB Migration: New notification types + triggers

**Step 1a: Extend notification_type enum**
```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'employer_interest_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'employer_nudge_received';
```

**Step 1b: DB trigger on `swipes` table for interest notifications**

New function `notify_candidate_on_employer_swipe()`:
- Fires AFTER INSERT on `swipes`
- If `direction = 'right'`: inserts notification for `target_user_id` with type `employer_interest_received`, title "💚 An employer is interested!", message "An employer liked your profile. If you like them back, you'll match!", action_url `/dashboard`
- If `direction = 'nudge'`: inserts notification for `target_user_id` with type `employer_nudge_received`, title "⚡ Super Interest received!", message "An employer sent you super interest — they really want to connect!", action_url `/dashboard`
- Skips if `direction = 'left'`

**Step 1c: DB trigger on `matches` table for match notifications**

New function `notify_both_on_match()`:
- Fires AFTER INSERT on `matches`
- Looks up the chat thread created by `create_thread_on_match` (query `chat_threads` by `match_id`)
- Notifies both `user_a` and `user_b` with type `match_created`, title "🎉 It's a Match!", message "You and [other party name] matched! Start chatting now.", action_url `/chat/{thread_id}`
- Gets names from `user_profiles`

---

#### Part 2 — Email extension in `send-chat-email` edge function

Add two new template handlers in `supabase/functions/send-chat-email/index.ts`:

```typescript
} else if (notification_type === 'employer_interest_received') {
  emailContent = generateEmployerInterestEmail({...});
} else if (notification_type === 'employer_nudge_received') {
  emailContent = generateEmployerNudgeEmail({...});
} else if (notification_type === 'match_created') {
  emailContent = generateMatchCreatedEmail({...});
}
```

Add 3 new email template functions to `supabase/functions/_shared/emailTemplates.ts`:
- `generateEmployerInterestEmail` — Lansa blue header, "An employer liked your profile" with CTA to dashboard
- `generateEmployerNudgeEmail` — amber header, "⚡ Super Interest received" with priority styling
- `generateMatchCreatedEmail` — green gradient header, "It's a Match!" with direct link to `/chat/{threadId}`

Also update `trigger_chat_notification_email()` DB function to include these 3 new types in its type check (`IF NEW.type NOT IN (...)`)

---

#### Part 3 — "Who's Interested" section on candidate mobile dashboard

New component: `src/components/dashboard/WhoIsInterestedSection.tsx`

This queries the `swipes` table for rows where:
- `target_user_id = auth.uid()`
- `direction IN ('right', 'nudge')`
- Candidate hasn't already swiped back on that employer (to avoid showing resolved ones)

For each employer swipe, fetch their `user_profiles_public` or `user_profiles` data to show:
- Avatar circle with cover color
- Name (anonymized as "An Employer" if profile is private)
- Interest level badge (⚡ Super Interest vs 💚 Interested)
- "Swipe Back" CTA → deep links to the candidate's opportunity discovery / job feed

**RLS note**: Candidates need read access to swipes where they are the target. The current swipes RLS only allows `swiper_user_id = auth.uid()`. A new policy is needed: `SELECT WHERE target_user_id = auth.uid() AND direction IN ('right', 'nudge')`.

The section renders in `OverviewTab.tsx` (candidate dashboard), shown only when `isCertified` (since only certified candidates are discoverable). On mobile it shows as a horizontal scroll row of cards. On desktop it collapses into a compact strip.

---

#### Part 4 — Remove duplicate client-side notifications

In `CandidateBrowseTab.tsx` (desktop), remove the manual `notificationService.createNotification()` call since the DB trigger now handles it server-side — prevents double notifications. The mobile `candidateDiscoveryService` already doesn't do this, so no change needed there.

---

### Files to Create/Edit

| File | Action | Change |
|------|--------|--------|
| DB migration | Create | Add enum values + 2 new trigger functions + 3 RLS policy + update email trigger type list |
| `supabase/functions/_shared/emailTemplates.ts` | Edit | Add 3 new email template functions |
| `supabase/functions/send-chat-email/index.ts` | Edit | Handle 3 new notification types |
| `src/components/dashboard/WhoIsInterestedSection.tsx` | Create | New section component |
| `src/components/dashboard/overview/OverviewTab.tsx` | Edit | Inject `WhoIsInterestedSection` |
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Edit | Remove duplicate client-side notification call |

---

### DB Trigger Flow After Implementation

```text
Employer taps ♥ (right) on mobile
        ↓
swipeService.recordSwipe() → INSERT into swipes
        ↓
[DB Trigger: notify_candidate_on_employer_swipe]
  → INSERT notification(type=employer_interest_received, user_id=candidate)
        ↓
[DB Trigger: trigger_chat_notification_email]
  → pg_net POST → send-chat-email
  → Resend email to candidate: "An employer liked your profile"

If candidate also swipes right back:
        ↓
[DB Trigger: create_match_if_mutual]
  → INSERT into matches
        ↓
[DB Trigger: create_thread_on_match]
  → INSERT into chat_threads
        ↓
[DB Trigger: notify_both_on_match]
  → INSERT notification for BOTH (type=match_created, action_url=/chat/{thread_id})
        ↓
[DB Trigger: trigger_chat_notification_email] fires for each
  → Resend email to both: "It's a Match!"
```

---

### Technical Notes

- The `notify_both_on_match()` trigger must run AFTER `create_thread_on_match()` to have the thread ID available. Both trigger on `matches` AFTER INSERT. Since both use `FOR EACH ROW`, we can rely on `chat_threads` being inserted synchronously in the same transaction by `create_thread_on_match()`.
- The "Who's Interested" query needs a new RLS policy on `swipes`: `FOR SELECT TO authenticated USING (target_user_id = auth.uid())` — narrow to only right/nudge swipes is done in the query, not the policy.
- Email rate limiting via `chat_email_log` already applies to all types going through `trigger_chat_notification_email`, so no extra work needed for the new types.
- The `WhoIsInterestedSection` will join swipes with `user_profiles` using a Supabase `.select()` with an embedded join. Since employers may have private profiles, fallback to "An Interested Employer" with initials avatar.
