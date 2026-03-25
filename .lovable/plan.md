
## Root Cause Analysis

### Problem 1 — "View Full Profile" goes to Not Found
`ProfileCard.tsx` navigates to `/profile/share/${urlName}-${user.id}` which maps to the `SharedProfile` page. This page queries `user_profiles_public` — a **separate table** that only gets populated when `user_profiles.is_public = true` (via a DB trigger). New users who haven't explicitly made their profile public have no row in `user_profiles_public`, so `useSharedProfileData` returns `profileData = null` and renders `ProfileNotFound`.

The route itself exists and is correct. The issue is purely that the user's profile is not yet public.

### Problem 2 — "Return to Login" logs the user out
`ProfileNotFound` has a button `onClick={() => navigate("/auth")}`. The `/auth` route in `App.tsx` maps to the `<Login />` page, which effectively signs the user out of their current session visually — they see the login screen even though they're logged in. For a logged-in user viewing their own profile link, this is completely wrong.

### Problem 3 — The button fires for users without a name
`handleCardClick` only navigates if `user?.id && userName`. If `userName` is empty (incomplete profile), clicking the button silently does nothing — no feedback at all.

---

## The Fix Plan

### 1. `ProfileCard.tsx` — Smart navigation based on profile state

Instead of navigating directly to the share URL (which fails for non-public profiles), detect the profile state first:

- If `isProfilePublic` is true → navigate to `/profile/share/...` as today
- If `isProfilePublic` is false → navigate to `/profile/share/...` but pass `state: { isOwnProfile: true }` so the page knows to show a helpful "make public" prompt rather than the generic Not Found
- If `userName` is empty (incomplete profile) → navigate to `/profile` with a toast hint to complete their profile first

We need to know if the profile is public. `useProfileData` already loads from `user_profiles` — check if that hook exposes `is_public`, or add a small check.

### 2. `ProfileNotFound.tsx` — Context-aware with logged-in user support

Add support for a new `isOwnProfile` prop (passed via router state):

- When `isOwnProfile = true` (logged-in user viewing their own not-yet-public profile): show a clear, helpful screen — "Your profile is private" with a CTA button "Make Profile Public" that calls the Supabase update (`is_public: true`) and then re-navigates to the share URL
- Keep the existing "Return to Login" button only for the case where `isOwnProfile` is false (a stranger viewing someone else's private/missing profile)
- Fix the "Return to Login" for the logged-in case: replace `navigate("/auth")` with `navigate("/dashboard")` — never log users out

### 3. Files to change

| File | Change |
|---|---|
| `src/hooks/useProfileData.ts` (or wherever `useProfileData` is defined) | Expose `isProfilePublic` field from the loaded `user_profiles` data |
| `src/components/dashboard/overview/ProfileCard.tsx` | In `handleCardClick`: check `isProfilePublic` and pass `state: { isOwnProfile: true }` when navigating. Add fallback if `userName` is empty → navigate to `/profile` with toast |
| `src/pages/SharedProfile.tsx` | Read `location.state?.isOwnProfile` and pass it down to `ProfileNotFound` |
| `src/components/profile/shared/ProfileNotFound.tsx` | Add `isOwnProfile` prop. When true: show "Your profile isn't public yet" with a "Make Profile Public" CTA button that updates `is_public = true` in DB then redirects to the share URL. Fix the back button to go to `/dashboard` (not `/auth`) for logged-in users |

### What the user now sees

1. Clicks "View Full Profile" → profile not public → lands on a clean "Your profile is private" page with a prominent "Make it Public" button
2. Clicks that button → profile becomes public → instantly redirected to their live shareable profile URL
3. If a stranger visits a private/nonexistent profile → same page but with the existing "not found" messaging and a "Go to Login" button (not "Return to Login" which implies logging out)
4. No user is ever accidentally sent to the login screen

### What does NOT change
- Route definitions in `App.tsx` — no changes
- `useSharedProfileData` hook — no changes
- DB schema or triggers — no changes
- All other flows (employer, mentor) — no changes
