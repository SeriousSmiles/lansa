
## Root Cause

The Supabase Realtime publication (`supabase_realtime`) only includes the `notifications` table. `chat_messages` and `chat_threads` are excluded — so even though the client subscribes correctly via `subscribeToThread`, Postgres never broadcasts the `INSERT` events. Messages only appear after a manual reload.

## Fix

### 1. Enable Realtime on the two tables (database migration)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
```

This is the **only required change**. The client-side subscription code in `chatService.subscribeToThread` is already written correctly — it just never receives events because the tables aren't in the publication.

### 2. Verify subscription channel stability in `useChat.ts`
One subtle issue: `loadMessages` is in the `useEffect` dependency array. Because `loadMessages` is a `useCallback` that depends on `threadId`, the effect re-runs whenever `threadId` changes — that's fine. But if anything causes `loadMessages` to be recreated unnecessarily, the channel is torn down and re-subscribed constantly. Removing `loadMessages` from the deps array (since `threadId` already covers it) prevents channel thrashing.

### 3. Add `REPLICA IDENTITY FULL` to `chat_messages`
Supabase Realtime only returns `new` row data for `INSERT` events by default, which is enough here. No changes needed.

---

## Files to change

**Migration only** — no frontend file changes needed. The subscription code already works. Just the two `ALTER PUBLICATION` SQL statements.

The `useEffect` dep array tweak in `useChat.ts` is a small defensive fix (remove `loadMessages` from deps, keep `threadId`).

### Summary
| Change | Type |
|---|---|
| Add `chat_messages` to realtime publication | DB migration |
| Add `chat_threads` to realtime publication | DB migration |
| Remove `loadMessages` from useEffect deps | `useChat.ts` (minor) |
