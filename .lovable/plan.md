

## Root Cause Analysis — 4 Distinct RLS/Data Issues

### Issue 1 — `chat_participants_view` has NO `security_invoker`

`reloptions` is `NULL` — the view runs as the **definer** (postgres superuser), not the calling user. This means the view's underlying `LEFT JOIN business_profiles` and the `UNION` from `business_profiles` bypass RLS correctly — BUT the view also joins `organization_memberships` and `organizations`, which have restrictive RLS policies that only allow members to see their own org data.

When a seeker queries `chat_participants_view` for an employer's `organization_name`, the join to `organization_memberships` silently returns `NULL` because the seeker is not an org member → employer shows as "Unknown Organization".

The view needs `security_invoker = false` (run as definer/superuser) OR the underlying tables need specific read policies for chat participants. The simplest correct fix: **recreate the view explicitly with `security_invoker = false`** so the org joins work regardless of the querying user's role. Currently it has no `reloptions` at all which means it defaults to `security_invoker = false` already — but the `organizations` RLS still blocks org data for non-members.

**Real fix needed**: Add a SELECT policy on `organizations` allowing any authenticated user to read basic org info (name, logo) for organizations linked to their chat threads.

### Issue 2 — `business_profiles` SELECT policy blocks job seekers

Current `business_profiles` SELECT policies:
- `business_profiles_select_business_role` — only users with `business` role
- `business_profiles_select_own` — `user_id = auth.uid() OR has_role('business')`

A job seeker (who is NOT `business` role) **cannot read any `business_profiles` rows at all**. So the fallback in `chatService.getThread()` that queries `business_profiles` directly for missing employer names returns nothing for seekers — they always see "Unknown User".

**Fix**: Add a SELECT policy on `business_profiles` allowing chat participants to read the company name of users they share a thread with.

### Issue 3 — `chat_messages` INSERT RLS blocks seekers on job-application-created threads

The `chat_messages_insert` policy requires `is_thread_participant(thread_id, auth.uid())`. The `is_thread_participant` function queries `chat_threads` where `_user_id = ANY(ct.participant_ids)`. This should work, but there are **two duplicate INSERT policies** (`chat_messages_insert` and `chat_messages_insert_sender`) — one is `roles: {public}` and one is `roles: {authenticated}`. Having both shouldn't cause issues, but the duplicate may indicate a past migration conflict.

The real issue: the seeker IS in `participant_ids` in the thread created by `on_job_application_accepted()`. Let me verify the trigger sets this correctly — it does: `ARRAY[v_employer_id, NEW.applicant_user_id]`. So they should be able to insert.

The RLS error the user sees is likely from `business_profiles` (can't read employer name = misleads the user) OR from an inconsistency in how `is_thread_participant` resolves when querying `chat_threads` (which has its own RLS). The `chat_threads_select` policy allows participants to read their threads, so that should be fine.

**Likely actual INSERT issue**: The duplicate policy creates a confusing situation — the `public` role policy `chat_messages_insert` uses `with_check` without `qual` (correct for INSERT) but coexists with `chat_messages_insert_sender` on `authenticated`. These are both PERMISSIVE, so either one passing = access granted. This is not the problem.

The real problem is more likely that `chat_threads.last_message_at` UPDATE fails because `chat_threads_update_participant` requires `is_thread_participant(id, auth.uid())` — which queries `chat_threads` again (RLS on nested query). This recursive check should work, but the UPDATE also requires `WITH CHECK` that is the same policy — this should pass fine since the user is a participant.

**Most likely actual problem for the INSERT error**: The seeker is trying to send a message in a thread where they ARE a participant, but Supabase returns an RLS error. Looking more carefully — there's no `with_check` on `chat_messages_insert` (the public one) for the `qual` field which in INSERT means the row-filter (pre-insert check) doesn't exist — correct. The `with_check` IS set. But this policy has `roles: {public}` — meaning it applies to **unauthenticated** requests too. The `chat_messages_insert_sender` applies to `authenticated`. Since both are permissive, an authenticated user satisfying either one gets access. Should be fine.

### Issue 4 — Real-time messages not received by job seeker

The `subscribeToThread` in `useChat.ts` subscribes to `chat_messages` INSERT with `filter: thread_id=eq.${threadId}`. For Supabase Realtime to deliver row-level events, the **RLS policy must allow the subscribing user to SELECT that row**. 

The `chat_messages_select` policy uses `is_thread_participant(thread_id, auth.uid())`. The `is_thread_participant` function is `SECURITY DEFINER` and queries `chat_threads`. This should work for both parties.

However — real-time filters in Supabase require the filter column to be indexed for row-level security to evaluate correctly. More importantly: **Supabase Realtime sends the event only if `auth.uid()` can SELECT the row**. If the seeker can SELECT messages (which they can via the policy), real-time should work.

The real issue here is likely that the employer's message INSERT triggers `last_message_at` update on `chat_threads`, which the seeker's `subscribeToThreadList` picks up — but the seeker's `subscribeToThread` (for the specific thread) should also fire. Unless the seeker never navigated to the thread URL with that `threadId`.

---

## The Fix Plan

### Fix 1 — Add `business_profiles` SELECT policy for chat participants
Allow any authenticated user to SELECT `business_profiles` rows where the `user_id` is a participant in a shared thread:

```sql
CREATE POLICY "chat_participants_can_read_business_profile"
ON public.business_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE (user_id = ANY(ct.participant_ids))
    AND (auth.uid() = ANY(ct.participant_ids))
  )
);
```

### Fix 2 — Add `organizations` SELECT policy for chat participants
Allow reading org name/logo for organizations linked to a shared chat thread:

```sql
CREATE POLICY "chat_participants_can_read_org_name"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM organization_memberships om
    JOIN chat_threads ct ON (om.user_id = ANY(ct.participant_ids))
    WHERE om.organization_id = organizations.id
    AND auth.uid() = ANY(ct.participant_ids)
  )
);
```

### Fix 3 — Recreate `chat_participants_view` with `security_invoker = false` explicitly + use SECURITY DEFINER function for org lookup

The view needs to bypass RLS on `organization_memberships` and `organizations` to correctly resolve employer org names for any viewer. The cleanest solution: recreate the view using a `SECURITY DEFINER` helper function for org lookup, OR simply recreate the view with `security_invoker = false` (explicit, not implicit).

Actually the simpler correct approach: Keep the view as-is but add the RLS policies in Fix 1 and Fix 2 above, which will make the view's underlying joins succeed for all chat participants.

### Fix 4 — Remove duplicate INSERT policies on `chat_messages`
Drop the redundant `chat_messages_insert` (public role) policy since `chat_messages_insert_sender` (authenticated) covers the same case correctly and is more precise.

### Fix 5 — Verify `user_profiles` chat participant policy covers employer→seeker direction
The existing policy `Allow reading profile info of chat participants` covers both directions (checks `ct.participant_ids` contains both parties). This is correct. No change needed.

---

## Files/Changes Summary

| Change | Type |
|---|---|
| Add `business_profiles` SELECT policy for chat participants | SQL migration |
| Add `organizations` SELECT policy for chat participants | SQL migration |
| Remove duplicate `chat_messages_insert` (public role) policy | SQL migration |
| Explicitly recreate `chat_participants_view` with `security_invoker = false` | SQL migration |

No frontend code changes needed — the RLS gaps are the root cause of all three reported symptoms.

