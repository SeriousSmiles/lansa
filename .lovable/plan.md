
## Root Cause Found — Precise Race Condition

**The bug is inside `loadState()` in `UnifiedAuthProvider.tsx`.**

### The exact sequence on login

```text
loadState() begins
  → setSession(currentSession)         ← isAuthenticated becomes TRUE
  → await fetchAllUserData(userId)     ← async gap here (DB queries running)
    [React flushes between these two lines]
    [DefaultRoute effect fires with: loading=false, isAuthenticated=TRUE, hasCompletedOnboarding=FALSE (still default)]
    [→ navigates to /onboarding ← THE BUG]
  → setHasCompletedOnboarding(true)    ← too late
  → setLoading(false)
```

`setSession` on line 175 makes `isAuthenticated = true` immediately. But `hasCompletedOnboarding` doesn't become `true` until line 204, after the async `fetchAllUserData()` await resolves. React can flush between those two lines, and `DefaultRoute`'s effect fires in that window.

`DefaultRoute` logic at that moment:
- `loading = false` (was set true then false in a previous cycle, or in the `SIGNED_IN` path where `initializedRef.current = true` keeps it as `isRefreshing` not `loading`)
- `isAuthenticated = true` ← just set by setSession
- `hasCompletedOnboarding = false` ← still default
- Effect condition `if (!hasCompletedOnboarding)` is TRUE → navigate('/onboarding')

### Why separate login pages would NOT fix this

The race condition is in `UnifiedAuthProvider`, not in routing logic. Any route would hit the same issue. Separate login pages would add complexity without solving the actual bug.

### The fix — one change, one file

**In `UnifiedAuthProvider.tsx`**: Move `setSession(currentSession)` to **after** `fetchAllUserData` resolves, and batch all state updates together at the end of `loadState()`.

This means `isAuthenticated` only becomes `true` in the same render cycle as `hasCompletedOnboarding = true`, eliminating the race window entirely.

```typescript
// BEFORE (causes race):
setSession(currentSession);         // isAuthenticated = true NOW
const data = await fetchAllUserData(userId); // async gap
setHasCompletedOnboarding(data.hasCompletedOnboarding); // too late

// AFTER (atomic):
const data = await fetchAllUserData(userId); // fetch first
setSession(currentSession);         // then set everything together
setHasCompletedOnboarding(data.hasCompletedOnboarding);
// React batches these in the same flush → no intermediate state
```

### Files to change

| File | Change |
|---|---|
| `src/contexts/UnifiedAuthProvider.tsx` | Move `setSession(currentSession)` from before `fetchAllUserData()` to after it, alongside all the other state setters at the bottom of `loadState()` |

No other files need to change. `DefaultRoute`, `LoginForm`, and the Guard system are all correct.
