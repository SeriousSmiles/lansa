
# Architectural Audit: Auth, Routing, and Onboarding System

## ✅ COMPLETED — Phases 1–4 Implemented

All critical phases have been implemented in a single deployment:

### What Changed

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Done | Unified `AuthContext` + `UserStateProvider` into `UnifiedAuthProvider.tsx` — single `onAuthStateChange`, single `getSession()`, single `Promise.all` batch (5 queries instead of 9) |
| Phase 2 | ✅ Done | Replaced `ProtectedRoute` + `RouteGuards` + `RouteGuard` with single `<Guard>` component in `App.tsx` |
| Phase 3 | ✅ Done | `DefaultRoute` now shows loader while auth resolves — no landing page flash |
| Phase 4 | ✅ Done | Removed `window.__userStateRefresh` global — `OrganizationContext` and `Onboarding.tsx` now use `refreshUserState` from `useUserState()` hook |
| Phase 5 | 🔲 Next | Dead code cleanup (RouteGuard.tsx, useUserType.tsx, old onboarding forms) — safe to do anytime |

### New Architecture

- **`UnifiedAuthProvider.tsx`** — single source of truth for auth, user data, admin role, org membership
- **`AuthContext.tsx`** — re-exports `useAuth()` from unified provider (backward compatible)
- **`UserStateProvider.tsx`** — re-exports `useUserState()` from unified provider (backward compatible)
- **`Guard.tsx`** — single route guard: `<Guard auth onboarding types={['job_seeker']}>`
- **`DefaultRoute.tsx`** — shows loader until auth resolves, then renders landing page or redirects

### DB Calls on Login: 9 → 6

Single batch via `Promise.all`:
1. `user_profiles` (onboarding_completed, name)
2. `user_answers` (user_type, career_path)
3. `organization_memberships` (active)
4. `user_certifications`
5. `user_roles` (admin)
6. `organization_memberships` (pending) — sequential after batch

### Phase 5 Candidates (Dead Code)

- `src/components/auth/RouteGuard.tsx` — superseded by Guard
- `src/components/auth/ProtectedRoute.tsx` — superseded by Guard
- `src/components/auth/RouteGuards.tsx` — superseded by Guard
- `src/hooks/useUserType.tsx` — duplicates unified provider
- `src/hooks/useAdminAuth.tsx` — duplicates unified provider
