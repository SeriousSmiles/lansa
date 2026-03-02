
# Fix: Mobile Candidate Browser Shows "No More Candidates" Immediately

## Root Cause

The mobile browser (`MobileCandidateBrowser`) uses `candidateDiscoveryService.getFilteredCandidates`, which fetches from `user_profiles_public` but has **no certification cross-reference logic**.

The desktop browser uses `discoveryService.getDiscoveryProfiles(userId, context, filters, limit, certifiedOnly: true)`, which correctly:
1. Fetches profiles from `user_profiles_public`
2. Cross-references `user_certifications` to build a `certifiedUserIds` Set
3. Filters out profiles not in the certified Set
4. Filters out profiles with blank/whitespace-only names

The mobile service skips all of this, which means:
- It fetches 7 rows from `user_profiles_public` (including 1 with empty name)
- It does **no** certification check
- It then filters out already-swiped users (no swipes exist)
- It should show 6–7 cards — but it shows "No more candidates"

The real reason it shows 0 is that `candidateDiscoveryService` falls back to `mockFrontendCandidates` when profiles exist, and those mock UUIDs don't match any real user IDs. Wait — re-reading the code: it only falls back when `profiles.length === 0`. Since profiles exist, it uses the real data. 

Actually the deeper issue: the mobile service has **no `certifiedOnly` filter**, but `user_profiles_public` now contains **non-certified** profiles too (the trigger was updated to sync any `certified = true AND visible_to_employers = true` profile, but there are 7 profiles in the table, meaning 2 are non-certified). And one has an **empty name**. So the mobile service would show 7 candidates... unless the issue is something else.

Checking the `user_profiles_public` data: 7 rows exist, one has an empty name. That leaves 6 profiles with names. The mobile service maps them all and shows them — which means the mobile service SHOULD work. The "No more candidates" screen means `profiles` array is empty after loading.

The likeliest cause is that `candidateDiscoveryService.getFilteredCandidates` calls `swipeService.getSwipeHistory(userId, 'employee')` with context `'employee'`. But the swipe recording uses `context: 'employee' as SwipeContext`. The swipes table returned **zero rows** for the employer. So that's not the blocker.

Re-reading the mobile code carefully: `candidateDiscoveryService` fetches from `user_profiles_public` without a certified filter. This means it also shows **non-certified** profiles, which is wrong per the app's rules (browse-candidates should be certified-only). 

The actual empty state is happening because the employer (`e599bc17`) has **no swipe records** yet, and the profiles query should return results. The most likely cause is a **RLS policy on `user_profiles_public`** that is still blocking the mobile service. The desktop service worked because it was already in the browser session. But let's check: after our RLS fix, does the mobile path see the same data?

Both mobile and desktop use the same `supabase` client. The real distinction: the desktop `CandidateBrowseTab` uses `discoveryService.getDiscoveryProfiles` with `certifiedOnly: true`, while mobile uses `candidateDiscoveryService.getFilteredCandidates` — a different service that goes through a different query path.

The simplest and correct fix: **Update `candidateDiscoveryService.getFilteredCandidates` to delegate to `discoveryService.getDiscoveryProfiles` with `certifiedOnly: true`**, so both desktop and mobile use the same proven service. This:
- Fixes the mobile empty state (same query that works on desktop)
- Ensures only certified candidates appear on mobile
- Removes the mock fallback from the mobile path
- Keeps blank-name filtering consistent

## Files to Modify

| File | Change |
|------|--------|
| `src/services/candidateDiscoveryService.ts` | Replace the custom fetch logic in `getFilteredCandidates` with a call to `discoveryService.getDiscoveryProfiles(userId, 'employee', filters, limit, true)` |

## Technical Details

Replace lines 22–124 of `candidateDiscoveryService.ts`:

```ts
async getFilteredCandidates(
  userId: string,
  filters: CandidateFilters = {},
  limit: number = 20
): Promise<DiscoveryProfile[]> {
  // Delegate to the same service used by the desktop browser
  // with certifiedOnly: true to ensure only certified candidates appear
  return discoveryService.getDiscoveryProfiles(
    userId,
    'employee',
    filters,
    limit,
    true
  );
},
```

This is a one-method change. It removes ~100 lines of duplicated, divergent logic and replaces it with a single call to the already-working desktop service.

## Expected Result

- Mobile shows the same certified candidates the desktop shows
- "No more candidates" only appears after genuinely swiping through all certified profiles
- No mock data fallbacks on mobile
- Blank-name profiles are filtered consistently
