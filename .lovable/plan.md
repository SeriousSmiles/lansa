
# Fix: Certified-Only Mode + Buttons Never Disabled on Current Candidate

## Two Separate Bugs Being Fixed

### Bug 1 — Buttons Gray and Unclickable

**Root cause (confirmed by code trace):**

In `SplitPanelBrowser.tsx` line 50:
```typescript
const hasReachedEnd = currentIndex >= totalProfiles - 1 && totalProfiles > 0;
```

With `certifiedOnly: true` and only John Nathan Stehpens as a certified user, the feed loads 1 profile:
- `currentIndex = 0`, `totalProfiles = 1`
- `0 >= 1 - 1` → `0 >= 0` → **true immediately**
- Buttons are disabled the moment the page loads, before the user has done anything

The condition is wrong — `hasReachedEnd` should only be true **after** the user has actioned the final card (moved past it), not while they are currently viewing the last card.

**Fix:**
```typescript
// Before (wrong — disables buttons while viewing last card):
const hasReachedEnd = currentIndex >= totalProfiles - 1 && totalProfiles > 0;

// After (correct — only disables after actioning final card):
const hasReachedEnd = currentIndex >= totalProfiles && totalProfiles > 0;
```

This is a one-character fix (`- 1` removed) but it completely resolves the disabled buttons issue regardless of how many candidates are in the feed.

Also, `advanceToNext` in `useCandidateNavigation.ts` prevents the index from ever exceeding `initialProfiles.length - 1`, so the "no candidates" empty state is still correctly shown when the user actions the last card.

### Bug 2 — John Nathan Stehpens Not Appearing

**Root cause:** The last edit changed `certifiedOnly` to `false` in both `loadProfiles` and `handleEndReached` in `CandidateBrowseTab.tsx`.

**Database confirms John is already certified:**
- `user_id: e15bf03c-4d06-4902-9a95-0701c54e3ea9`
- `lansa_certified: true`
- `verified: true`
- `assessment_score: 95`
- `certified_at: 2025-11-18`

No database changes needed. Just reverting `certifiedOnly` back to `true` in both calls will surface John correctly.

### Bug 3 — advanceToNext Stays Stuck at Last Index

When the user actions the last profile, `advanceToNext` clamps at `initialProfiles.length - 1` (line 44-46 of the hook). This means `currentIndex` never reaches `totalProfiles` to trigger the empty state. We need to allow it to go one past the end so the empty state renders.

**Fix in `useCandidateNavigation.ts`:**
```typescript
// Before:
if (nextIndex >= initialProfiles.length) {
  return prev; // stuck, never shows empty state
}

// After:
return nextIndex; // allow going to length, which triggers empty state
```

The `currentProfile` will be `undefined` at index `length`, which `SplitPanelBrowser` already handles with the "No Candidates Available" empty state.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Revert `certifiedOnly: false` → `true` in both `loadProfiles` and `handleEndReached` |
| `src/components/discovery/desktop/SplitPanelBrowser.tsx` | Fix `hasReachedEnd` condition: remove the `- 1` |
| `src/hooks/useCandidateNavigation.ts` | Allow `advanceToNext` to go past the last index so empty state triggers |

## No Database Changes Required

John Nathan Stehpens is already certified in the database. No migration needed.

## Expected Result

- John Nathan Stehpens appears in the browse feed as a certified candidate with his Lansa Certified badge
- Pass / Super Interest / Interested buttons are fully active and clickable while viewing any candidate including the last one
- After actioning the last candidate, the empty state appears correctly
- All previously fixed animations and layout improvements remain intact
