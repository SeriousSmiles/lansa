
## Root Cause

The swipe-exclusion logic in `discoveryService.ts` is correct **in isolation**, but breaks in practice because of a race condition:

1. `handleSwipeAction` fires the DB swipe insert **asynchronously** (non-blocking `await`)
2. Index advances immediately in the same tick
3. When the deck runs out (index === profiles.length), `loadCandidates()` is called
4. At that moment, the last 1–3 swipes may not be committed to Supabase yet
5. The exclusion query runs and misses those uncommitted swipe IDs
6. Those same candidates come back in the fresh deck

**Secondary issue:** `loadCandidates()` is also called when `filters` change (line 51 `useEffect`), which re-fetches but still relies on the DB being up to date.

## The Fix

### Approach: Track swiped IDs locally in component state

Instead of relying solely on the DB to exclude swiped candidates, maintain a local `Set<string>` of swiped user IDs in `MobileCandidateBrowser`. When `loadCandidates()` is called (deck exhausted or filter change), pass these locally-tracked IDs to the service — or simply filter them out client-side after the fetch.

This is a **zero-migration, zero-schema-change** fix. The DB exclusion still works for page refreshes (catches all historical swipes). The local Set catches the within-session race condition.

### Changes

**`MobileCandidateBrowser.tsx`** (primary fix):

1. Add `const swipedInSession = useRef<Set<string>>(new Set())` — persists across re-renders without causing re-renders
2. In `handleSwipeAction`, immediately add `currentProfile.user_id` to the Set before any async call
3. In `loadCandidates()`, after fetching, filter out any profile whose `user_id` is in the local Set
4. On `handleUndo`, remove the undone profile's `user_id` from the Set

**`discoveryService.ts`** — no change needed, the DB exclusion already works correctly for fresh page loads / refreshes. The local Set handles the within-session gap.

### Visual: Before vs After

```text
BEFORE:
  swipe card → DB insert (async) → index advances
  deck empty → loadCandidates() → DB may not have last 2-3 swipes → they come back ❌

AFTER:
  swipe card → add to localSet (sync) → DB insert (async) → index advances
  deck empty → loadCandidates() → filter result by localSet → clean fresh deck ✅
  page refresh → DB exclusion query runs → all historical swipes excluded ✅
```

### Files Changed

| File | Change |
|---|---|
| `src/components/mobile/employer/MobileCandidateBrowser.tsx` | Add `swipedInSession` ref; add to Set on swipe; filter fetch results against Set; remove from Set on undo |

One file. No DB changes. No breaking changes to any existing logic.
