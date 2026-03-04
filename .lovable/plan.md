
## The Investigation: Why Users Always Land on /onboarding After Login

### What I found

There are **two competing navigation systems** running simultaneously at login, and they conflict in a predictable sequence that always produces the wrong result on the first login attempt.

---

### The Two Systems

**System 1: `LoginForm.tsx` — the "old" navigator**

After a successful password login, `LoginForm.tsx` independently fetches user data and navigates the user. The critical flaw is on **line 65**:

```typescript
const destination = userType === 'employer' ? '/employer-dashboard' : '/dashboard';
```

It only handles `'employer'` and `'job_seeker'`. It has **no case for `'mentor'`**. A mentor would be sent to `/dashboard`.

But more critically — it imports from the **old** `AuthContext` and the old `question` service (`getUserAnswers`, `hasCompletedOnboarding`). These are separate from the `UnifiedAuthProvider`. This means on login it is checking onboarding completion through a **different, independent code path** that may evaluate differently.

**System 2: `DefaultRoute.tsx` — the "new" navigator**

This component sits at the `/` route and uses `useUnifiedAuth()`. When the user is authenticated and loading is done, it reads `hasCompletedOnboarding` from the UnifiedAuthProvider and redirects accordingly.

---

### The Race Condition (The Exact Bug)

Here is the sequence of events that happens on every login:

1. User submits credentials on `/login`
2. `signIn()` is called (from old `useAuth()` → `AuthContext.tsx`)
3. Supabase returns the session
4. `LoginForm.tsx` immediately calls `getUserAnswers()` directly — this is a **raw database query**, independent of `UnifiedAuthProvider`
5. While that query is in flight, `UnifiedAuthProvider` also fires `loadState()` (triggered by `onAuthStateChange` → `SIGNED_IN` event)
6. `LoginForm.tsx`'s query resolves. It sees `onboardingCompleted = true` and `userType = 'employer'`
7. `LoginForm.tsx` calls `navigate('/employer-dashboard', { replace: true })`
8. The browser navigates to `/employer-dashboard`
9. The `Guard` wrapping `EmployerDashboard` checks `useUnifiedAuth()` — but `UnifiedAuthProvider.loadState()` **hasn't finished yet** (it's still running its 6-query batch)
10. At this moment, `loading = true` in `UnifiedAuthProvider`, so `Guard` shows the loading spinner — **correct so far**
11. `UnifiedAuthProvider.loadState()` finishes. `hasCompletedOnboarding = true`, `userType = 'employer'`
12. `Guard` re-evaluates: session ✓, onboarding ✓, type ✓ → renders dashboard ✓

**So why does this fail?**

The failure happens when step 7 navigates somewhere but the `SIGNED_IN` event trigger has a `setTimeout(() => loadState(), 0)` delay (line 262 of UnifiedAuthProvider). This means:

- `LoginForm` navigates to `/employer-dashboard`
- `Guard` initially has `loading = true` so it shows the spinner
- `loadState()` runs and completes — user should see the dashboard

**But there's a second trigger path.** When `LoginForm` calls `signIn()` which calls `supabase.auth.signInWithPassword()`, this fires the `onAuthStateChange` callback with `SIGNED_IN`. At that moment `initializedRef.current` is `false` (user was logged out before), so line 257 sets `setLoading(true)`. The `setTimeout` defers `loadState()`. 

Then `LoginForm` runs its **own** independent `getUserAnswers()` query which completes faster and navigates to `/employer-dashboard`. At this point `UnifiedAuthProvider` is in a `loading = true` state and hasn't set `hasCompletedOnboarding` yet.

`Guard` sees: `loading = true` → show spinner ✓  
Then `loadState()` finishes → `loading = false`, `hasCompletedOnboarding = true`, `userType = 'employer'` → dashboard renders ✓

**This should work — so what breaks it?**

The key is: `LoginForm` navigates based on the **old `hasCompletedOnboarding` function** which checks `career_path_onboarding_completed` in `user_answers`. But `UnifiedAuthProvider.fetchAllUserData()` checks **both** `user_profiles.onboarding_completed` AND `user_answers.career_path_onboarding_completed`. 

**When the new `user_profiles.onboarding_completed` column was added and LoginForm was NOT updated to use it**, the two systems can disagree:

- `LoginForm` checks old column → may return `false` for users who completed onboarding via the new path
- Result: `LoginForm` sends user to `/onboarding`
- User lands on `/onboarding`, which is a `<Guard auth>` with no onboarding check — it just renders
- User removes `/onboarding` from URL, goes to `/`, `DefaultRoute` fires, `UnifiedAuthProvider` (which reads the new column correctly) sees onboarding complete → redirects to correct dashboard

**That exactly matches the behavior you described: first attempt → onboarding, remove URL → correct dashboard.**

---

### Summary of All Root Causes

| # | Cause | Impact |
|---|---|---|
| 1 | `LoginForm.tsx` uses the **old `hasCompletedOnboarding()` service** from `src/services/question.ts` which may not check `user_profiles.onboarding_completed` | Returns `false` for users who completed via new path → sends to `/onboarding` |
| 2 | `LoginForm.tsx` uses `useAuth()` from the old `AuthContext`, not `useUnifiedAuth()` | Two independent auth systems run in parallel after login |
| 3 | `LoginForm.tsx` has **no case for `'mentor'` user type** (line 65) | Mentors always get sent to `/dashboard` regardless |
| 4 | `LoginForm.tsx` does an **independent DB query after login** instead of waiting for `UnifiedAuthProvider` to finish loading | Inconsistent state — LoginForm and Guard evaluate different data |

---

### The Fix

The right fix is **surgical and minimal**: delete all post-login navigation logic from `LoginForm.tsx` entirely. Let `UnifiedAuthProvider` + `DefaultRoute` handle it — that's what they exist for.

After `signIn()` succeeds in `LoginForm`, simply call `navigate('/')` and let `DefaultRoute` redirect to the correct destination. `DefaultRoute` already reads from `UnifiedAuthProvider` (the single source of truth) and correctly handles all three user types + onboarding state.

This eliminates both navigation systems competing, and makes login routing follow one clean path:

```
Login → signIn() → navigate('/') → DefaultRoute reads UnifiedAuthProvider → correct dashboard
```

### Files to change

| File | Change |
|---|---|
| `src/components/auth/LoginForm.tsx` | Remove `getUserAnswers` / `hasCompletedOnboarding` imports and post-login DB query. After `signIn()` succeeds, call `navigate('/', { replace: true })` |
| No other files need to change | `DefaultRoute` already handles all cases correctly |
