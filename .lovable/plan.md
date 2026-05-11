## Problem

Today every "missing step" button on `ProfileCompletionCard` just calls `navigate(step.cta_route)` and every `cta_route` in `get_profile_completion` is `/profile` (or `/onboarding`). The user lands on the Profile page with no idea where to go next, and clicks frequently die. That kills completion momentum — the exact thing the engine is supposed to prevent.

The card buttons must do what they say: "Upload a profile photo" must open the photo picker, "Write your About section" must open the About editor focused on the textarea, "Add at least one experience" must open the Add Experience dialog, "Make your profile visible to employers" must flip the visibility toggle, etc.

## Approach

Single intent-routing layer between the card and the profile sections — no rewrites of editors.

```text
ProfileCompletionCard click
        │  navigate("/profile?action=<step.key>")
        ▼
Profile page mounts ──► ProfileActionRouter (new effect)
        │  1. Reads ?action= from URL
        │  2. Scrolls to [data-completion-step="<key>"]
        │  3. Dispatches CustomEvent("lansa:profile-action", { key })
        │  4. Strips ?action= from URL (replaceState)
        ▼
Each editor (About / Experience / Education / Skills / Languages /
Photo / Title / Visibility) listens via a tiny `useProfileActionListener(key, handler)` hook
and opens its own dialog / focuses its own input / toggles its own state.
```

This keeps the contract narrow (one event name + one data attribute) and avoids prop-drilling refs through `ProfileContent → ProfileSidebar → AboutContainer → …`.

## Changes

### 1. New util: `src/hooks/useProfileActionListener.ts`
- Tiny hook: subscribes to `window`'s `lansa:profile-action` CustomEvent and runs `handler()` when `event.detail.key === key`.

### 2. New component: `src/components/profile/ProfileActionRouter.tsx`
- Mounted once inside `Profile.tsx`.
- On mount + on `location.search` change:
  - Parse `?action=<key>`.
  - `scrollIntoView` on `[data-completion-step="<key>"]` (smooth, block:"center").
  - Wait one frame, dispatch `CustomEvent("lansa:profile-action", { detail: { key } })`.
  - `navigate(pathname, { replace: true })` to clear the param so it does not re-fire on every render.
- Special case `visibility_on`: do not dispatch — call `updateUserProfile({ visible_to_employers: true })` directly, toast "You're visible to employers.", then refresh completion.
- Special case `onboarding_done`: navigate to `/onboarding` immediately.

### 3. Section wrappers in `ProfileContent.tsx`
Add `data-completion-step` on each section container:
- About wrapper → `about_text`
- Experience wrapper → `experiences`
- Education wrapper → `education`
- Sidebar wrapper → handles `profile_photo`, `basic_info`, `title`, `skills`, `languages`
  (one anchor with multiple keys via `data-completion-step="profile_photo title skills languages basic_info"`, router matches any token).

### 4. Editor listeners (one-line each)
Inside each editor's container that already owns the open/close state, add:
```ts
useProfileActionListener("experiences", () => setAddOpen(true));
```
- `about/AboutContainer` → focus the about textarea / open edit mode for `about_text`.
- `experience/ExperienceContainer` → open Add Experience dialog for `experiences`.
- `education/EducationContainer` → open Add Education dialog for `education`.
- `ProfileSidebar` (or its skills sub-component) → open Add Skill input for `skills`.
- `ProfileSidebar` languages sub-component → open Add Language dialog for `languages`.
- `ProfileSidebar` avatar → trigger the hidden file input for `profile_photo`.
- `ProfileSidebar` name field → focus name input for `basic_info`.
- `ProfileSidebar` title field → focus title input for `title`.

(For any section whose current internals are not yet known, the router still scrolls to it — the user lands on the right spot even if the auto-open does not fire. The listener is added in a follow-up read of that file.)

### 5. `ProfileCompletionCard.tsx`
- Replace `navigate(step.cta_route || "/profile")` with `navigate(`${step.cta_route ?? "/profile"}?action=${step.key}`)`.
- Continue button stays `/profile` (no action).

### 6. No DB changes
`get_profile_completion`'s `cta_route` values stay as-is (`/profile`, `/onboarding`); the `key` drives the action. No migration needed.

## Verification

After implementing, manually click each of the 10 step buttons on the card and confirm: page scrolls to the right section, the matching editor opens / field is focused / toggle flips, URL is cleaned, completion score recomputes via the existing DB trigger when the user saves.

## Files touched

- new `src/hooks/useProfileActionListener.ts`
- new `src/components/profile/ProfileActionRouter.tsx`
- edit `src/pages/Profile.tsx` (mount router)
- edit `src/components/profile/layout/ProfileContent.tsx` (data attributes)
- edit `src/components/profile/ProfileCompletionCard.tsx` (append `?action=`)
- edit each editor container to add the one-line listener (About, Experience, Education, Sidebar sub-components)
