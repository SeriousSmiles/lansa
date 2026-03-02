
# Fix: Candidate Browse Loop Bug + Real User Data

## Bug Root Cause (Confirmed)

The bug at candidates 15-17 is a **profiles array replacement + stale index collision**:

1. `useCandidateNavigation` tracks `currentIndex` as internal state (e.g., 17)
2. When `currentIndex >= totalProfiles - 3`, `onEndReached()` fires
3. `handleEndReached` calls `loadProfiles()` which calls `setProfiles(newData)` — **replacing** the array with a freshly shuffled 20 mock candidates
4. `currentIndex` is still 17 but now points to a completely different profile in the new array — visual jump/flash
5. No debounce exists, so it fires 3 times (at indices 17, 18, 19), causing 3 rapid replacements

## Fix 1 — Append profiles instead of replacing (Critical)

In `CandidateBrowseTab.tsx`, `handleEndReached` should **append** newly loaded profiles to the existing array rather than replacing it. This means `currentIndex` 17 still points to the same profile, and the new candidates are queued behind.

Also add a loading guard so `handleEndReached` cannot fire multiple times in rapid succession:

```
// Before (bug):
setProfiles(data);

// After (fix):
setProfiles(prev => {
  const existingIds = new Set(prev.map(p => p.user_id));
  const newOnes = data.filter(p => !existingIds.has(p.user_id));
  return [...prev, ...newOnes];
});
```

Since mock candidates have fixed IDs (`mock-1` through `mock-20`), the dedup filter (`existingIds`) will prevent duplicates from being added. To avoid this blocking new pages, the mock candidate data will need to be shuffled with a suffix variant — OR we simply skip deduplication for mock IDs and just append them as a fresh "page". The simplest and most robust fix: use an `isLoadingMore` ref guard so `handleEndReached` can only fire once at a time, and append the result regardless.

## Fix 2 — Show Real Users (Remove certifiedOnly filter for now)

The database has real users with real data:
- **John Nathan Stehpens** — Creative Specialist, 3 experiences, education, 4 languages, achievements, certifications, full profile
- **Saviëntaly Noten** — Skills and languages, partial profile
- One blank profile (can be filtered out by checking if name is non-empty)

Currently `certifiedOnly: true` is passed in `CandidateBrowseTab.tsx` even though `user_certifications` returns `[]`. This means real users are always filtered out and employers only ever see mock candidates.

**Fix**: Change `certifiedOnly` to `false` so real database users are shown. Add a simple quality filter — skip profiles where `name` is blank/whitespace. The `isCertified` badge will still render correctly based on actual certification data (it checks the set independently).

This is a product decision — showing uncertified real users vs. mock certified users. Since the platform is in early growth, showing real users (even uncertified) provides more authentic value than 20 identical mock profiles.

## Fix 3 — Add isLoadingMore guard

In `useCandidateNavigation`, the `onEndReached` call fires at index 17, 18, AND 19 (since the effect runs on every `currentIndex` change). Add a `isLoadingMoreRef` boolean ref in `CandidateBrowseTab` to prevent repeated calls:

```typescript
const isLoadingMoreRef = useRef(false);

const handleEndReached = async () => {
  if (isLoadingMoreRef.current) return;
  isLoadingMoreRef.current = true;
  await loadMoreProfiles(); // appends
  isLoadingMoreRef.current = false;
};
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Add `isLoadingMoreRef` guard, change `handleEndReached` to append not replace, change `certifiedOnly` to `false`, filter blank-name profiles |
| `src/services/discoveryService.ts` | Add name quality filter (skip blank names) in the `.filter()` step |

## What Is NOT Changed

- `useCandidateNavigation.ts` — hook logic is fine as-is
- `SplitPanelBrowser.tsx` — no changes needed
- `LeftPanel.tsx`, `RightPanel.tsx` — no changes needed
- Mobile `SwipeDeck` — untouched
- Mock data — preserved as fallback when no real profiles exist

## Expected Result After Fix

- Browsing past candidate 17 no longer causes a visual jump or blank/flash
- Real database users (John Nathan Stehpens, Saviëntaly Noten) appear in the feed alongside mock candidates
- Blank/incomplete profiles (the unnamed user) are filtered out
- `handleEndReached` can only fire once at a time, preventing triple-replacement
