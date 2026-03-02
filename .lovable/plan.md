
## Root Cause: `upsert` vs Partial Unique Index Mismatch

### The Problem

The `swipes` table has two unique indexes:

1. `uniq_swipe_with_listing` — covers `(swiper_user_id, target_user_id, context, job_listing_id)` — full constraint when a job listing is present
2. `uniq_swipe_without_listing` — covers `(swiper_user_id, target_user_id, context)` WHERE `job_listing_id IS NULL` — this is a **partial** index

Postgres `ON CONFLICT` in an `upsert` requires a **non-partial** unique constraint on exactly the columns specified. The code passes `onConflict: 'swiper_user_id,target_user_id,context'`, but the only index covering those three columns is the partial one (`WHERE job_listing_id IS NULL`). Postgres cannot resolve a partial index as the conflict target for `ON CONFLICT`, so it throws `42P10` — "there is no unique or exclusion constraint matching the ON CONFLICT specification."

This breaks **every swipe** — buttons, drag gestures, everything — because the error is thrown before any insert succeeds.

### The Fix

Switch from `upsert` back to a plain `insert`. Duplicate swipes are already prevented by the DB indexes — if a duplicate arrives, Postgres throws `23505` (unique violation). The code already has `if (error && error.code !== '23505') throw error` but it was short-circuited because `upsert` throws `42P10` first, before reaching the duplicate check.

The corrected logic:

```ts
const { data, error } = await supabase
  .from('swipes')
  .insert([swipeData])
  .select()
  .single();

if (error && error.code !== '23505') throw error;
return data;
```

This:
- Inserts the swipe normally — DB triggers fire for notifications as expected
- On a true duplicate (same person re-swiping the same candidate), silently swallows the `23505` error
- Never fails with `42P10` because no `ON CONFLICT` clause is sent to Postgres

### Why Not Add a Full Constraint to the DB?

The partial index structure is intentional — it allows different uniqueness rules depending on whether a job listing is attached. Adding a full constraint would change the DB's data model. The code-side fix is the correct, minimal approach.

### What Changes

**File: `src/services/swipeService.ts`**

In `recordSwipe`, replace the `.upsert(...)` call with `.insert(...)`. Remove the `onConflict` and `ignoreDuplicates` options. The existing `error.code !== '23505'` guard already handles true duplicates correctly.

No other files need changing. No DB migrations needed. Notifications, DB triggers, and match logic are all unaffected — the `insert` path is identical to the original flow before the upsert was introduced.
