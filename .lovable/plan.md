
## Root Cause: Navigation Fires Before Context Updates

In `handleCareerPathSelect` (`Onboarding.tsx`), this sequence has a race condition:

```
markOnboardingComplete() → refreshUserState() → navigate('/profile')
```

`refreshUserState()` calls `setIsRefreshing(true)` then does async DB work. But `navigate('/profile')` fires immediately **after** the `await` — the issue is that `loadState` (called by `refreshUserState`) sets state updates in one batch only at the end. However, `Guard` on `/profile` checks `hasCompletedOnboarding` from context, which is still `false` from the previous render. Guard reads the stale value and redirects back to `/onboarding` — the flash. Then the refresh completes, `hasCompletedOnboarding` becomes `true`, and the user finally reaches `/profile`.

The same race condition exists in the recovery path (`useEffect` in `Onboarding.tsx`).

### The Fix

The fix is simple and surgical: **defer `navigate()` until after `refreshUserState` has fully resolved by using a state-based navigation trigger** — or more cleanly, **pass `hasCompletedOnboarding: true` directly into the context before navigating**, bypassing the async re-fetch entirely.

The cleanest approach: in `Onboarding.tsx`'s `handleCareerPathSelect`, instead of calling `refreshUserState()` (which re-fetches everything from DB), call it BUT navigate only from a `useEffect` that watches `hasCompletedOnboarding` becoming `true`.

**Specifically:**

### File Changes

**1. `src/pages/Onboarding.tsx`**

Replace the direct `navigate()` calls after `markOnboardingComplete` + `refreshUserState` with a deferred approach:

- Add a `pendingNavigation` ref/state (`'/profile'` or `'/dashboard'`)
- After `markOnboardingComplete`, call `refreshUserState()`, then set `pendingNavigation` to the target path (with the state)
- Add a `useEffect` that watches `hasCompletedOnboarding` — when it becomes `true` AND `pendingNavigation` is set, call `navigate(pendingNavigation, ...)` and clear the ref
- This guarantees Guard sees `hasCompletedOnboarding: true` before the route renders

Apply the same pattern to the recovery path in the `loadUserAnswers` `useEffect`.

This is a 3-line logic change — no architectural changes, no new components, no routing changes.
