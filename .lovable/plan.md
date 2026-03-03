
## Plan: Add Session Swipe Tracking to Desktop CandidateBrowseTab

### Root Cause (Same as Mobile)
`CandidateBrowseTab` calls `loadProfiles()` only once on mount — so there's no re-fetch loop issue. However, `SplitPanelBrowser` uses `useCandidateNavigation` which iterates over the `profiles` array. The race condition is different here: if a user refreshes or the component remounts mid-session, already-swiped profiles can reappear because the DB hasn't indexed the last few swipes yet.

The fix mirrors the mobile approach: track swiped `user_id`s in a `useRef<Set<string>>` in `CandidateBrowseTab`, filter out those IDs from `profiles` state after each swipe action, and also filter any future `loadProfiles` call results.

### Changes

**`src/components/dashboard/employer/CandidateBrowseTab.tsx`** only:

1. Add `import { useRef } from "react"` 
2. Add `const swipedInSession = useRef<Set<string>>(new Set())`
3. In `loadProfiles`, after `setProfiles(data)`, filter: `setProfiles(data.filter(p => !swipedInSession.current.has(p.user_id)))`
4. In `handleSwipe`, **before** the async DB call: `swipedInSession.current.add(profile.user_id)` — then also immediately update `profiles` state to remove that profile: `setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id))`

Wait — `SplitPanelBrowser` drives navigation via `useCandidateNavigation(profiles)` which uses an index counter. If we remove profiles from the array mid-session, the index gets out of sync.

**Better approach**: Keep `profiles` state intact. Instead, filter the array passed down to `SplitPanelBrowser`. Maintain a derived filtered list:

```
const visibleProfiles = profiles.filter(p => !swipedInSession.current.has(p.user_id));
```

And pass `visibleProfiles` to `SplitPanelBrowser` instead of `profiles`. This way:
- The displayed deck is always free of already-swiped candidates
- `useCandidateNavigation` re-initialises when the filtered array changes (it already resets on `profiles` prop change via `useEffect`)
- On `loadProfiles` refresh, new results are also filtered against the local Set

This is one file change, zero schema changes, mirrors the mobile fix exactly.

### Summary

| File | Change |
|---|---|
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Add `swipedInSession` ref; add to Set in `handleSwipe` before async call; pass filtered `visibleProfiles` to `SplitPanelBrowser` |
