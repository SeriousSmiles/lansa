
## Issues Identified

### 1. Bottom Nav overlaps content (job seeker mobile)
`BottomNav` is always `fixed bottom-0` — it never auto-hides. When users are on a chat thread or scrolling through discovery, it sits on top of content.

**Fix**: Add scroll-direction detection in `BottomNav`. Hide nav when scrolling down, reveal when scrolling up. This is the standard mobile pattern (used by Instagram, LinkedIn, etc.) — momentum-friendly, not intrusive.

Implementation: `useRef` for last scroll Y + `window.addEventListener('scroll')` in `BottomNav`. When scrolling down > 10px threshold → slide nav to `y(100)`, scrolling up → slide back to `y(0)`. Use Framer Motion's `animate` prop.

Also: The bottom nav currently shows on the `/chat/:threadId` sub-route for job seekers, overlapping the `ChatInput`. The nav should **hide entirely** when inside an active thread. Add `/chat/` (with ID) to the hide condition in `AppShell`.

---

### 2. Messages not appearing in chat canvas

**Root cause (confirmed by DB query)**:
- `chat_participants_view` is a plain view (no `SECURITY DEFINER`) that queries `user_profiles`
- The new RLS policy `Allow reading profile info of chat participants` IS in place — but the view still runs as the **invoker's permission**, so the policy should apply

However, looking at `chatService.sendMessage()` — it inserts a message and then **separately** updates `chat_threads.last_message_at`. The `chat_threads` UPDATE policy is `is_thread_participant(id, auth.uid())` — this is fine.

The real issue with messages not appearing: **`chatService.subscribeToThread()` uses Postgres Changes real-time on `chat_messages`**. Supabase Realtime Postgres Changes require the table to have **RLS enabled** AND the user to have a SELECT policy that matches the payload row. Currently there are two duplicate SELECT policies — while redundant, they shouldn't break things.

BUT: The actual message display issue is likely that `getThread()` calls `getThreadsForUser()` which does a second full fetch. If `chat_participants_view` returns empty for the other party (which would mean `other_party: undefined`), the thread object has no `other_party` and the UI shows `loading` state indefinitely or "Unknown" with messages never appearing.

**Let me check**: The RLS policy added was `Allow reading profile info of chat participants` on `user_profiles`. The view `chat_participants_view` queries `user_profiles` directly without SECURITY DEFINER — so the invoker (logged-in user) sees only rows where the policy permits. The new policy allows them to see profiles of users they share a chat_thread with. This **should work** — but only if the policy was correctly applied (which the DB query confirms it was).

There's one more potential issue: the `chat_participants_view` also joins `organization_memberships` and `organizations`. If those tables have RLS that blocks the query, the join may return null for org fields even if the user row is visible.

**Most likely live issue**: The `send-chat-email` edge function fix from the previous round may have introduced a syntax/import error, causing a startup failure that manifests as messages not sending. Let me verify.

Actually — the user says messages don't appear "not even to the sender." This is a strong signal that **`sendMessage` is failing at the DB INSERT level**. The INSERT policy on `chat_messages` requires `is_thread_participant(thread_id, auth.uid())`. If the thread was created by a trigger/service role (not by the user), the `chat_threads_insert_participant` policy won't block the read, but there could be a `created_by` column issue.

**The concrete fix**: 
1. Ensure real-time is enabled for `chat_messages` table (check via Supabase realtime config)
2. The `sendMessage` INSERT has `sender_org_id` field — need to confirm it exists in the schema. If not, the insert silently fails.
3. Add error surface in `ChatInput` — currently errors in `sendMessage` are only `console.error`'d, so the user sees nothing wrong

For the company logo issue: `ChatThreadListItem` and `MobileChatInbox ThreadRow` show `other.organization_name` as text but **never render the `organization_logo`**. The `ChatThread` type has `organization_logo` in `other_party`, but neither the desktop list item nor the mobile thread header display it. For job seekers looking at employer threads, this logo should appear.

---

### 3. Back button navigates employers to wrong dashboard

In `MobileChatInbox` (line 114): `navigate('/dashboard')` — hardcoded, should be `/employer-dashboard` for employers.

In `DesktopChatLayout` (line 23): `const dashboardPath = userType === 'employer' ? '/dashboard' : '/dashboard'` — **both arms are `/dashboard`**! This is the bug. It should be `userType === 'employer' ? '/employer-dashboard' : '/dashboard'`.

---

## Files to Change

### `src/components/chat/desktop/DesktopChatLayout.tsx`
Fix line 23: `'/employer-dashboard'` for employers.

### `src/components/chat/mobile/MobileChatInbox.tsx`
Fix line 114: `navigate('/employer-dashboard')` for employers.

### `src/components/mobile/app/BottomNav.tsx`
- Add scroll-direction auto-hide behavior using `useEffect` with `scroll` event listener
- Hide nav entirely when `location.pathname` includes `/chat/` with a thread ID (active thread = full-screen, nav obstructs input)

### `src/components/mobile/app/AppShell.tsx`
- Add `pb-20` exclusion for active chat thread route (`/chat/:id`)

### `src/components/chat/desktop/ChatThreadListItem.tsx` + `MobileChatInbox ThreadRow`
- Show company logo (`organization_logo`) for employer threads as a small avatar next to the name/org text

### `src/components/chat/shared/ChatInput.tsx`
- Surface send errors with a toast so users know when messages fail

### `useChat.ts` send error surfacing
- Add `toast.error` on catch in `sendMessage`

### Message visibility deeper fix
- In `chatService.sendMessage`, add explicit console logging to surface any Supabase errors
- Verify `sender_org_id` column exists in `chat_messages` — if not, the insert fails silently on that field

Let me check `sender_org_id` in the schema before finalizing.

---

## Summary Table

| File | Change |
|---|---|
| `DesktopChatLayout.tsx` | Fix employer dashboard path (`/employer-dashboard`) |
| `MobileChatInbox.tsx` | Fix employer back navigation to `/employer-dashboard` |
| `BottomNav.tsx` | Add scroll-direction hide/show; hide on active chat thread |
| `AppShell.tsx` | Exclude padding-bottom on active chat thread route |
| `ChatThreadListItem.tsx` | Show `organization_logo` for employer threads |
| `MobileChatInbox.tsx` ThreadRow | Show `organization_logo` |
| `useChat.ts` / `ChatInput` | Surface send errors via toast |
| `chatService.ts` | Add explicit error logging in `sendMessage` |
