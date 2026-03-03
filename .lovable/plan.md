
## Full Diagnosis

### Issue 1: Messages not appearing in the chat canvas

The RLS policies on `chat_messages` have **two duplicate SELECT policies** — `chat_messages_select` AND `chat_messages_select_participant`. Both use `is_thread_participant(thread_id, auth.uid())`. The real problem is the **INSERT policy** — there are also two INSERT policies (`chat_messages_insert` and `chat_messages_insert_sender`) with no `USING` clause shown, meaning the `WITH CHECK` expression may be missing or misconfigured, which would cause the insert to silently succeed at DB level but not return the data correctly to the client.

More critically: **`chatService.sendMessage()` inserts a message and then updates `last_message_at` on the thread. But the real-time subscription in `useChat.ts` only fires on new INSERT to `chat_messages` filtered by `thread_id`. If the RLS check fails on SELECT after INSERT, the real-time payload comes through but the sender's own optimistic update may be duped or dropped.**

The root cause is the `chat_participants_view` — it has **no RLS** (no policies returned from pg_policies), so it falls through to the base table policies. The view joins `user_profiles` (which has its own RLS). A user querying the view can only see rows where `user_profiles` RLS permits SELECT — meaning they can see their own row but potentially NOT the other party's row, causing `other_party` to return as `undefined`/null.

When `other_party` is `null`, `thread` returns null → `loading` stays as initial state or messages don't render correctly because `thread?.other_party` is undefined even after messages load.

**Fix**: Grant explicit SELECT on `chat_participants_view` without RLS restriction (it's already a filtered view). The view itself only shows name/image/org info — no PII beyond what's needed for chat. Add a proper RLS policy or ensure the view's base `user_profiles` table allows reading other participants' public fields when they're in a shared thread.

Actually looking more carefully: `user_profiles` likely has an RLS policy that only allows users to read their own row. That means when `chatService.getThreadsForUser()` queries `chat_participants_view` for the other party's user_id, it gets 0 rows back (blocked by `user_profiles` RLS), so `other_party` is always `undefined`.

**The fix**: Create a security-definer function OR a properly scoped view that allows reading basic public profile fields (name, profile_image, title, org) for users who share a chat thread with you.

### Issue 2: Email names showing "Your connection" / "Your match" / "Someone"

In `send-chat-email/index.ts`:
- Line 74: `otherPartyName: 'Your connection'` — hardcoded fallback, no real name lookup
- Line 82: `senderName: 'Someone'` — hardcoded, no lookup
- Line 101: `otherPartyName: 'Your match'` — hardcoded

The `notifications` table `metadata` field only stores `employer_id` etc., not the other party's name. The fix: in the edge function, after getting the notification type, look up the other party's `user_id` from the notification metadata/context (e.g., `metadata.employer_id`, `metadata.other_user_id`, or via the `chat_threads` or `matches` tables) and fetch their name from `user_profiles`.

For `chat_request_accepted` and `match_created`: The edge function receives `action_url` which contains `/chat/:threadId`. We can parse the thread ID from `action_url`, query `chat_threads` to get `participant_ids`, identify the other party, and fetch their name.

For `message_received`: Parse thread ID from action_url, query `chat_messages` ordered by `created_at DESC LIMIT 1` to get `sender_id`, fetch that user's name from `user_profiles`.

### Issue 3: Chat page has no navigation / feels disconnected

The `/chat` route renders `DesktopChatLayout` which:
- Has NO back button or link to return to the user's dashboard
- Has no sidebar/nav context — just a floating page
- The `AppShell` only shows `BottomNav` for `job_seeker` users. **Employer users on mobile visiting `/chat` get NO navigation** — confirmed in `AppShell.tsx` line 40: `userType === 'job_seeker'`

For desktop, the `DesktopChatLayout` has no top nav bar. For job seekers this is fine since they have `BottomNav`. But there's no "← Back to Dashboard" in the desktop layout.

For employers on mobile at `/chat`, there's zero navigation (no BottomNav, no back button to return to employer dashboard).

**Fix needed**:
1. Add a "← Back to [Dashboard]" button to `DesktopChatLayout` header (role-aware: links to `/dashboard` for seekers, `/employer-dashboard` for employers)
2. For mobile employer users at `/chat`, `MobileChatInbox` already has a header but no way back to employer dashboard — add a back arrow that navigates to `/employer-dashboard`
3. Both mobile layouts (`MobileChatInbox` and `MobileChatThread`) need role-aware back navigation

---

## Files to Change

### 1. DB Migration — Fix `chat_participants_view` access
Create a `security definer` function `get_chat_participant_info(user_id uuid)` that bypasses RLS to return public profile fields for any user. OR update `user_profiles` RLS to allow reading public fields of participants you share a thread with.

The cleanest approach: add a `security definer` view wrapper or alter the view to use `security_invoker=false` and grant direct access (safe since it only exposes public name/avatar/org data).

**Migration**: Add RLS policy to `user_profiles` that allows `SELECT` on public fields when the viewer shares a `chat_thread` with the target user. OR create a function that the view uses.

Actually cleanest: Create a `SECURITY DEFINER` function `get_thread_participant_profile(thread_id uuid)` → returns the other party's public info. But that changes the query structure significantly.

**Simplest safe fix**: Add a Supabase RLS policy on `user_profiles` table:
```sql
CREATE POLICY "Allow reading public profile info of chat participants"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads ct
    WHERE user_profiles.user_id = ANY(ct.participant_ids)
    AND auth.uid() = ANY(ct.participant_ids)
  )
);
```
This allows any authenticated user to read the profile of someone they share a chat thread with. This is exactly the consent model — chat only exists after mutual consent, so profile visibility for name/avatar is appropriate.

### 2. `supabase/functions/send-chat-email/index.ts` — Fix name resolution
For `chat_request_accepted` and `match_created`:
- Parse thread ID from `action_url` (e.g., `/chat/UUID`)  
- Query `chat_threads` for `participant_ids`
- The other party = participant who is NOT `user_id`
- Fetch their name from `user_profiles` using service role (bypasses RLS)

For `message_received`:
- Parse thread ID from `action_url`
- Query `chat_messages` for the most recent message's `sender_id`
- Fetch sender name from `user_profiles`

For `chat_request_received`:
- The `title` contains the requester name (e.g., "John wants to connect") — already partially parsed
- Better: store `requester_user_id` in notification metadata when creating the notification, OR parse `metadata` if available

The notification metadata for `chat_request_accepted` is empty `map[]` — need to enrich by looking up the thread.

### 3. `src/components/chat/desktop/DesktopChatLayout.tsx` — Add back navigation
Add a top bar with:
- App logo / "Lansa" brand text on left
- "← Messages" breadcrumb or back to dashboard button (role-aware)
- For job seekers: link to `/dashboard`
- For employers: link to `/employer-dashboard`

### 4. `src/components/chat/mobile/MobileChatInbox.tsx` — Add employer back navigation
- The header currently has no back button
- For employers (detect via `useUserState().userType`): show a `← Back` arrow in header that calls `navigate('/employer-dashboard')`
- For seekers: no back needed (BottomNav handles it)

### 5. Deploy `send-chat-email` edge function

---

## Summary of Changes

| File | Change |
|---|---|
| New DB migration | RLS policy on `user_profiles` to allow reading co-participants' public info |
| `supabase/functions/send-chat-email/index.ts` | Look up real names for other party from `user_profiles` using thread/message data |
| `src/components/chat/desktop/DesktopChatLayout.tsx` | Add role-aware top nav bar with back to dashboard |
| `src/components/chat/mobile/MobileChatInbox.tsx` | Add back navigation for employer users |
| Deploy `send-chat-email` | Redeploy with name resolution fix |
