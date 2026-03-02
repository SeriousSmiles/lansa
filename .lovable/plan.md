
# Fix: Endless Loop, Remove Mocks, Show Only Real Certified Users

## Root Cause Analysis

### Problem 1 — Endless counter loop

The `SplitPanelBrowser.tsx` has this effect:
```typescript
useEffect(() => {
  if (currentIndex >= totalProfiles - 3 && !isLoading) {
    onEndReached();
  }
}, [currentIndex, totalProfiles, isLoading, onEndReached]);
```

`handleEndReached` appends new results. Since mock candidates use `startsWith('mock-')` which bypasses the deduplication check, the same 20 mocks get appended on every call: 20 → 40 → 60 → 80... creating an endless growing list. The counter displays increasing totals that the user can never finish.

### Problem 2 — Saviëntaly Noten not appearing

Database query confirmed: only John Nathan Stehpens has a `user_certifications` record with `lansa_certified = true AND verified = true`. Saviëntaly has no certification record at all. With `certifiedOnly: true`, she is correctly excluded — she has not passed an exam.

This is correct product behavior. If the user wants Saviëntaly to appear, she needs to pass a certification exam first.

### Problem 3 — Mock/seeded candidates appearing

The service has two fallback paths that return mock data:
1. When `certifiedOnly = true` returns 0 real certified profiles → returns 20 mock candidates
2. On any error → returns shuffled mock candidates

Both of these must be removed. The product requirement is: **show only real users who have passed at least one certification exam**.

## What the Feed Should Show Today

Based on database reality:
- **John Nathan Stehpens** — only real certified user
- When the user has reviewed all certified candidates → show a clean empty state ("No certified candidates right now — check back soon")
- **No mock/seeded candidates ever**

## Fix Plan

### Change 1 — Remove all mock fallbacks from discoveryService.ts

Remove the three paths that return `mockFrontendCandidates`:
1. The `certifiedOnly && discoveryProfiles.length === 0` fallback (lines 161–169)
2. The outer fallback at line 187–202 (when `publicProfiles` is empty)
3. The catch block fallback at line 206–208

Replace each with a clean `return []` so the empty state is shown properly.

Also remove the import of `mockFrontendCandidates` since it will no longer be used here.

### Change 2 — Disable `onEndReached` entirely when certifiedOnly is true

Since the database has a finite, known set of certified users, there is no "next page" to load. Appending more profiles is meaningless. The fix: in `CandidateBrowseTab.tsx`, the `handleEndReached` function should simply do nothing (early return) — because with `certifiedOnly: true`, there is no infinite scroll scenario. Once all certified candidates are reviewed, the empty state should show.

The `SplitPanelBrowser` effect that fires `onEndReached` at `totalProfiles - 3` will fire, but `handleEndReached` will immediately return without doing anything.

### Change 3 — Fix the index reset guard in useCandidateNavigation.ts

Currently the `useEffect` resets `currentIndex` to 0 if it's out of bounds:
```typescript
if (currentIndex >= initialProfiles.length && initialProfiles.length > 0) {
  setCurrentIndex(0);
}
```

This is the "jump" bug's other root. When `handleEndReached` was appending mocks and the user was at index 20 of 20, the array grew to 40 — triggering this guard which reset to 0. Now that we're not appending anymore, this is less critical, but the guard should be kept as a safety measure.

### Change 4 — Show a better empty state when no certified candidates exist

Replace the generic "No Candidates Available" message with a more specific and encouraging message:
- "You've reviewed all certified candidates" 
- "Check back as new professionals earn their Lansa Certification"
- This applies both when the initial load returns 0 AND when the user actions the last card

## Files to Modify

| File | Change |
|------|--------|
| `src/services/discoveryService.ts` | Remove all 3 mock fallback paths, return `[]` instead |
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Make `handleEndReached` a no-op (immediate return) |
| `src/components/discovery/desktop/SplitPanelBrowser.tsx` | Improve empty state messaging |

## What Is NOT Changed

- `certifiedOnly: true` — stays, this is correct behavior
- `user_certifications` table — no database changes needed
- Saviëntaly's profile — she needs to pass an exam first (correct)
- John Nathan Stehpens — will appear correctly as the only certified candidate
- Left/Right panels, animations, color identity — all preserved

## Expected Result After Fix

- Only John Nathan Stehpens appears in the feed (the only certified user)
- After actioning his card, the clean empty state shows
- The counter shows "1 of 1 candidates" — no looping, no growing numbers
- No mock/seeded candidates ever appear anywhere
- If more users earn certification in future, they automatically appear
