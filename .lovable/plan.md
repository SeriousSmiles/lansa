
# Fix 3: Dead Code Cleanup, AppShell Re-render Optimization, and DB Trigger Error

## Fix 1: Dead Code Cleanup (Phase 5)

The following files are **no longer imported anywhere** and can be safely deleted:

### Files to Delete
- `src/components/auth/ProtectedRoute.tsx` -- replaced by `Guard`
- `src/components/auth/RouteGuard.tsx` -- replaced by `Guard`
- `src/components/auth/RouteGuards.tsx` -- replaced by `Guard`
- `src/components/onboarding/SimplifiedOnboardingForm.tsx` -- not imported
- `src/components/onboarding/EnhancedOnboardingForm.tsx` -- not imported
- `src/components/onboarding/MultiStepForm.tsx` -- not imported
- `src/hooks/useSimplifiedOnboarding.ts` -- only imported by `SimplifiedOnboardingForm` (also being deleted)

### Files to Update (replace `useUserType` hook with `useUserState`)
The `useUserType` hook (`src/hooks/useUserType.tsx`) makes its own database call on every mount, duplicating what `useUserState()` already provides. Six files still import it:

1. `src/pages/Dashboard.tsx` -- change `useUserType()` to `useUserState()`
2. `src/pages/BrowseCandidates.tsx` -- same
3. `src/pages/OpportunityDiscovery.tsx` -- same
4. `src/components/dashboard/TopNavbar.tsx` -- same
5. `src/components/dashboard/UserProfile.tsx` -- same
6. `src/components/profile/header-actions/DesktopProfileActions.tsx` -- same

After updating all 6 consumers, delete `src/hooks/useUserType.tsx`.

**Impact**: Eliminates 6 redundant database queries per page load across the app.

---

## Fix 2: AppShell Re-render Optimization

`AppShell.tsx` currently has a `console.log` on every render (line 36-48) that fires ~10 times during load. Two changes:

1. **Remove the verbose `console.log`** -- it served its debugging purpose during development
2. **Memoize the `showMobileNavigation` computation** with `useMemo` so the derived boolean only recalculates when its dependencies actually change, preventing unnecessary child re-renders

---

## Fix 3: Database Trigger Error (`schema "net" does not exist`)

A trigger called `send_segment_email_on_color_change` is attached to the `user_profiles` table. It fires the function `trigger_segment_change_email`, which calls `net.http_post()` -- but the `pg_net` extension is **not enabled** on this Supabase project. Every time a user's `color_auto` field changes, the trigger fires and throws `schema "net" does not exist`.

**Fix**: Create a migration that drops the broken trigger and its function:

```sql
DROP TRIGGER IF EXISTS send_segment_email_on_color_change ON user_profiles;
DROP FUNCTION IF EXISTS trigger_segment_change_email();
```

This trigger was meant to send segment-change emails via an edge function. If this functionality is needed later, it should be re-implemented using a Supabase webhook or by enabling the `pg_net` extension -- but right now it only generates errors.

---

## Summary

```text
Change                                  | Type       | Risk
---------------------------------------------------------
Delete 7 unused files                   | Deletion   | None (no imports)
Update 6 files to use useUserState      | Refactor   | Low (same data, different source)
Delete useUserType hook                 | Deletion   | None (after consumer update)
Remove console.log + add useMemo        | Optimize   | None
Drop broken DB trigger                  | Migration  | None (trigger only throws errors)
```

Total: 7 files deleted, 7 files edited, 1 migration created.
