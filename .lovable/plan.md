
## Goal

Extend the Portal v2 experience (left rail + content + right context drawer) to all **opportunity-seeker** pages, the **profile editor**, and the **public shared profile**. Add a global, persistent **Legacy mode** toggle that flips users back to the existing UI.

## Scope

**Seeker pages getting the Portal shell:**

- `/dashboard` — already on v2 (no change)
- `/jobs` (`LearningJobFeed.tsx`)
- `/profile` (`ProfilePage` via `ProfileLayout`)
- `/profile/resume-editor` (`ResumeEditor` → `ResumeEditorLayout`)
- `/discovery` (`OpportunityDiscovery`)
- `/resources`
- `/content` (`ContentLibrary`)
- `/certification` (dashboard view only — exam/result flows stay full-screen)
- `/chat` (desktop only — keeps its own internal layout, just wrapped in the rail)
- `/notifications`

**Public:**

- `/profile/share/:userId` (`SharedProfile`) — gets the new visual treatment but no left rail (it's public; show a simple top bar with brand + "Sign in" CTA).

**Out of scope** (intentionally untouched):

- `/employer-dashboard`, `/browse-candidates`, `/organization/settings`
- `/mentor-dashboard`
- All admin pages
- Mobile experience: rail is hidden < `lg` (already the case); pages keep their existing mobile layouts.
- Onboarding, login, signup, certification exam flow itself.

## Approach

### 1. Promote the portal flag to a global preference

Move the localStorage flag from a Dashboard-only state to a small shared hook so every wrapped page reads/writes the same value.

- New file: `src/hooks/usePortalMode.ts` — reads/writes `lansa.dashboardPortalV2`, returns `{ portalV2, setPortalV2, toggle }`. Exposes a `window` event so multiple mounted pages stay in sync.
- Default: ON. Setting `0` opts into Legacy.

### 2. Reusable Portal page wrapper

New file: `src/components/dashboard/portal/PortalPageShell.tsx`

```text
┌──────────┬────────────────────────────────────┬──────────────┐
│ PortalRail│   <header? title + actions>      │  Context     │
│           │   {page children}                │  panel       │
│           │                                  │  (Sheet)     │
└──────────┴────────────────────────────────────┴──────────────┘
```

- Mounts `PortalRail` on the left, `PortalContextPanel` on the right (drawer, hidden by default).
- Provides an inner content container with a **standard page header**: optional eyebrow, big title, subtitle, right-aligned actions slot.
- Uses the same warm `bg-[rgba(253,248,242,1)]` and `max-w-[1440px]` content rhythm as `PortalShell`.
- Accepts `fullBleed` prop for pages like Chat that want zero padding inside.
- Rail and right drawer are reused exactly as on `/dashboard`, so navigation, profile, AI coach, insights, activity views all work consistently.

### 3. Wrap each seeker page

For each page in scope:

- Replace `DashboardLayout` with the new `PortalPageShell` *when* `portalV2` is on; otherwise render the existing `DashboardLayout` path. Each page keeps **internal card placement and content unchanged** — only the chrome changes.
- The "Profile" page is special: `ProfileLayout` already manages the full chrome (cover color, header). We will:
  - Keep `ProfileLayout` intact in legacy mode.
  - In v2 mode: render the same `ProfileContent` and `ProfileFooter` children **inside** `PortalPageShell`, with a slimmed-down header strip (cover color block + name + actions) so card placement stays identical, but the global rail and right-drawer experience matches the rest of the portal.
- Resume editor: wrap `ResumeEditorLayout` inside `PortalPageShell` with `fullBleed`. Editor's own toolbar stays.
- Chat (desktop): wrap `DesktopChatLayout` inside `PortalPageShell` with `fullBleed`; mobile path untouched.
- Certification: wrap only the dashboard branch (when no `sector`/`resultId`); exam + reflection report stay full-screen as today.

### 4. Public Shared Profile (no auth)

`SharedProfile` is public, so it must not show the authenticated rail or context panel.

- New file: `src/components/profile/shared/SharedProfilePortalShell.tsx`
- Provides:
  - Slim top bar (brand mark left, "Sign in" / "Get Lansa" CTA right)
  - Centered content column matching the Portal v2 typography scale, padding and warm background
  - Footer "Made on Lansa" badge stays
- `SharedProfileContainer` renders inside this shell when v2 is on (default for everyone). Card placement and section order are preserved — only the wrapping chrome and visual rhythm change.
- Legacy view falls back to the current `SharedProfileContainer` chrome.
- Toggle button still appears (anonymous visitors get a session-storage scoped toggle) so they can preview legacy too.

### 5. Global Legacy-mode toggle

Replace the dashboard-local toggle button with a small global control, available on every portal-wrapped page.

- New file: `src/components/dashboard/portal/LegacyModeToggle.tsx`
- Two presentations:
  - **Floating pill** (default, bottom-right) for portal v2 — "New experience · Use classic"
  - **Header chip** for legacy mode — "Try the new experience"
- Uses `usePortalMode()`. After toggling, performs a soft refresh (`window.location.reload()`) so deeply nested layouts pick up the change cleanly.
- Mounted by `PortalPageShell` (and the shared-profile shell) once, so every wrapped page exposes it.
- Removed from `Dashboard.tsx` since the wrapper now owns it.

### 6. Preserving card placement

The user's explicit constraint: keep placement of cards similar on the profile editor (and by extension, every wrapped page). The implementation only swaps the **outer chrome**:

- No card components are reordered.
- No grid breakpoints inside pages are changed.
- Internal sticky behavior of profile sidebar/tools is preserved (the rail is sticky outside the page content area, so internal `sticky top-X` rules still work).

## Technical details

**New files**

- `src/hooks/usePortalMode.ts`
- `src/components/dashboard/portal/PortalPageShell.tsx`
- `src/components/dashboard/portal/LegacyModeToggle.tsx`
- `src/components/profile/shared/SharedProfilePortalShell.tsx`

**Edited files**

- `src/pages/Dashboard.tsx` — use `usePortalMode`, drop local toggle button (now global).
- `src/pages/LearningJobFeed.tsx`
- `src/pages/Resources.tsx`
- `src/pages/ContentLibrary.tsx`
- `src/pages/Certification.tsx` (dashboard branch only)
- `src/pages/Notifications.tsx`
- `src/pages/Chat.tsx` (desktop branch only)
- `src/pages/OpportunityDiscovery.tsx`
- `src/pages/ResumeEditor.tsx`
- `src/components/profile/ProfilePage.tsx` — branch on `portalV2`, mount `PortalPageShell` wrapping `ProfileContent` + `ProfileFooter` with a compact header bar; legacy path keeps current `ProfileLayout`.
- `src/pages/SharedProfile.tsx` and/or `SharedProfileContainer.tsx` — branch on `portalV2`, wrap with `SharedProfilePortalShell`.

**Pattern per page (illustrative)**

```tsx
const { portalV2 } = usePortalMode();
return portalV2 ? (
  <PortalPageShell title="Jobs" subtitle="...">
    {/* same body content as before, no re-ordering */}
  </PortalPageShell>
) : (
  <DashboardLayout ...>{/* legacy body */}</DashboardLayout>
);
```

**Memory update**

After implementation, save a note to `mem://architecture/portal-v2-shell-coverage` describing which seeker pages are wrapped and that `usePortalMode` + `lansa.dashboardPortalV2` is the single source of truth.

## Out of scope

- Re-skinning internal cards. Visual treatment of cards stays as-is; only outer chrome changes.
- Mobile portal redesign — rail is `hidden lg:flex` and mobile uses each page's existing mobile layout.
- Employer / mentor / admin surfaces.
