
## Root Cause Found

**The `chat_messages` table has NO `UPDATE` RLS policy.**

The `markThreadRead` function in `chatService.ts` calls:
```sql
UPDATE chat_messages SET read_at = now()
WHERE thread_id = ? AND sender_id != me AND read_at IS NULL
```

Because there is no `UPDATE` policy, Supabase's RLS silently blocks this write — no error thrown, 0 rows updated. Messages are **never marked as read in the database**, so:
- `read_at` is always `null` on every message sent by the other party
- `getTotalUnreadCount()` always returns the full count
- The badge never clears
- Thread rows always show the unread dot

Every debounce, optimistic update, and real-time subscription that was previously added was compensating for this underlying DB policy gap — but none of it could survive a page reload or a fresh query.

## The Fix

**One database migration** to add an UPDATE policy on `chat_messages` that allows a participant to mark messages as read (set `read_at`) — but only for messages sent to them (not their own messages):

```sql
CREATE POLICY "chat_messages_update_read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (is_thread_participant(thread_id, auth.uid()))
WITH CHECK (is_thread_participant(thread_id, auth.uid()));
```

This is the only change needed. All the existing service and hook logic is correct — it just never had permission to write to the database.

## What This Fixes
- Unread counter clears when opening a thread ✓
- Badge on nav disappears after reading ✓  
- Thread rows lose the unread indicator after viewing ✓
- Counter stays at 0 after reading (survives refresh) ✓
- Real-time count is accurate ✓

## Files to Change
| Target | Change |
|---|---|
| Supabase DB (migration) | Add `UPDATE` policy on `chat_messages` for authenticated participants |

No frontend code changes needed. The existing logic is correct.
