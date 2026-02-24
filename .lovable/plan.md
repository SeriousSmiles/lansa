

# Architectural Audit: Auth, Routing, and Onboarding System

## Your Assessment is Correct

After reading every file involved in the login-to-dashboard flow, the system has significant architectural debt. Here is a detailed breakdown of the problems and a phased remediation plan.

---

## Problems Found

### Problem 1: Duplicate Auth/State Infrastructure (Two Systems Doing the Same Job)

There are **two separate auth contexts** that both listen for auth changes and both query the database on every login:

- **`AuthContext.tsx`** -- manages `session`, `user`, `loading`, plus fetches `user_profiles.name`
- **`UserStateProvider.tsx`** -- manages `session` (again via `getSession()`), `userType`, `hasCompletedOnboarding`, `careerPath`, org data, certification data, plus its own `loading`

Both set up `onAuthStateChange` listeners independently, both call `getSession()`, and both have their own `loading` states. On login, both fire simultaneously, creating a race condition where one resolves before the other, causing the flash you described.

### Problem 2: Triple Admin Check (Same Query, Three Places)

The admin role check (`SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'`) is executed independently in **three separate components**:

1. `ProtectedRoute.tsx` -- runs the query in a `useEffect`
2. `RouteGuard.tsx` -- runs the same query in a `useEffect`  
3. `AdminRoute.tsx` -- runs the same query in a `useEffect`

Each has its own `isAdmin` state and `adminCheckComplete` flag. On every protected page load, up to 3 identical database calls fire.

### Problem 3: Three Competing Route Guard Systems

There are **three different guard implementations**, all used simultaneously:

1. **`ProtectedRoute.tsx`** -- an `<Outlet>`-based layout guard wrapping all protected routes in `App.tsx`
2. **`RouteGuards.tsx`** -- exports `RequireAuth`, `RequireOnboarding`, `RequireUserType` as wrapper components, nested inside the `ProtectedRoute` outlet
3. **`RouteGuard.tsx`** -- a unified guard component (mostly unused in the actual routes)

The actual routing in `App.tsx` layers `ProtectedRoute` (which checks auth + admin + onboarding) **and then** wraps individual routes with `RequireOnboarding` + `RequireUserType` from `RouteGuards.tsx`. This means:

- Auth is checked twice (once in `ProtectedRoute`, once in `RequireAuth`)
- Onboarding is checked twice (once in `ProtectedRoute`, once in `RequireOnboarding`)
- Admin is checked up to 3 times
- Each check has its own `loading` state that resolves at different times, causing sequential loading flashes

### Problem 4: DefaultRoute Creates a Visible Flash

`DefaultRoute` renders `<Index />` (the landing page) immediately, then fires a `useEffect` to check state and navigate away. Authenticated users **see the landing page flash** for a frame before being redirected to their dashboard.

### Problem 5: Database Query Waterfall on Login

When a user logs in, the following queries fire (many in parallel, some sequential):

1. `AuthContext`: `getSession()` 
2. `AuthContext`: `user_profiles.name` (setTimeout deferred)
3. `UserStateProvider`: `getSession()` (duplicate)
4. `UserStateProvider`: `user_profiles.onboarding_completed`
5. `UserStateProvider`: `user_answers.user_type, career_path`
6. `UserStateProvider`: `organization_memberships` (active)
7. `UserStateProvider`: `user_certifications`
8. `UserStateProvider`: `organization_memberships` (pending) -- sequential, after the first batch
9. `ProtectedRoute`: `user_roles` (admin check)
10. Each `RequireOnboarding`/`RequireUserType` re-reads from UserState context (no extra queries, but re-evaluates loading states)

That is **9 database calls** before the user sees their dashboard, with at least 2 being duplicates and the admin check being irrelevant for 99% of users.

### Problem 6: Global State Exposed on Window Object

`UserStateProvider` line 246: `(window as any).__userStateRefresh = refreshUserState` -- a global mutation used by the mentor onboarding to trigger a refresh. This is fragile and untraceable.

---

## Phased Remediation Plan

### Phase 1: Unify Auth into a Single Provider (Highest Impact, Lowest Risk)

**Goal**: Merge `AuthContext` and `UserStateProvider` into one `AuthProvider` that:
- Sets up `onAuthStateChange` once
- Calls `getSession()` once
- Fetches all user data (profile, answers, org, cert, admin role) in a **single** `Promise.all` batch
- Exposes one `loading` boolean
- Exposes `session`, `user`, `userType`, `hasCompletedOnboarding`, `isAdmin`, `organizationId`, etc.

**Why safe**: All consumers currently use `useAuth()` or `useUserState()`. We keep both hooks working but point them at the same underlying provider internally. No route changes needed.

**Database calls reduced from 9 to 5** (one batch), with admin check included.

### Phase 2: Replace Three Guard Systems with One

**Goal**: Replace `ProtectedRoute`, `RouteGuards`, and `RouteGuard` with a single `<Guard>` component that accepts config props:

```text
<Guard auth onboarding allowedTypes={['job_seeker']}>
  <Dashboard />
</Guard>
```

This component:
- Reads from the unified auth provider (one source of truth)
- Shows a single loading state until all data is ready
- Evaluates auth, onboarding, user type, and admin in one pass
- Never renders children until the decision is made (no flash)

**Route definitions become cleaner**:
```text
Before (current):
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={
      <RequireOnboarding soft={false}>
        <RequireUserType allowedTypes={['job_seeker']}>
          <Dashboard />
        </RequireUserType>
      </RequireOnboarding>
    } />
  </Route>

After:
  <Route path="/dashboard" element={
    <Guard auth onboarding types={['job_seeker']}>
      <Dashboard />
    </Guard>
  } />
```

### Phase 3: Fix DefaultRoute Flash

**Goal**: Instead of rendering `<Index />` and then navigating away in a `useEffect`, `DefaultRoute` should:
1. Show a loading indicator while auth state resolves
2. Only render `<Index />` if the user is NOT authenticated
3. If authenticated, navigate immediately without rendering the landing page

This is a small change but eliminates the most visible symptom.

### Phase 4: Remove Window Global and Centralize Refresh

**Goal**: Replace `(window as any).__userStateRefresh` with a proper React pattern -- either pass `refreshUserState` through context (already available via `useUserState`) or use an event emitter. The mentor onboarding component should call `refreshUserState()` from the hook, not from `window`.

### Phase 5: Clean Up Dead Code

Remove:
- `RouteGuard.tsx` (the "unified" one that is barely used)
- `useUserType.tsx` hook (duplicates what `UserStateProvider` already provides)
- `useOnboardingCompletion.ts`, `useSimplifiedOnboarding.ts` if unused
- `SimplifiedOnboardingForm.tsx`, `EnhancedOnboardingForm.tsx`, `MultiStepForm.tsx` if superseded by `AIOnboardingFlow`

---

## Implementation Safety

Each phase is independently deployable and testable:

- **Phase 1** changes the data layer only -- hooks keep the same API
- **Phase 2** changes the route definitions -- but behavior stays identical
- **Phase 3** is a 10-line change
- **Phase 4** is a 5-line change  
- **Phase 5** is deletion only

No database migrations needed. No RLS changes. No edge function changes. This is purely frontend architectural cleanup.

---

## Summary Table

```text
Problem                         | Phase | Risk  | Impact
-----------------------------------------------------------
Dual auth providers             | 1     | Low   | High (eliminates race conditions)
9 DB calls on login             | 1     | Low   | High (reduces to 5)
Triple admin check              | 1     | Low   | Medium
Three guard systems             | 2     | Med   | High (eliminates flash)
DefaultRoute flash              | 3     | Low   | High (visible UX fix)
Window global hack              | 4     | Low   | Low (code quality)
Dead code / unused components   | 5     | Low   | Low (maintainability)
```

