## Goal

Bring the `/profile` page in line with the Portal v2 design language used by Dashboard, Resume Editor, Certification, etc. — same rail, same context drawer, same typographic header, same warm `#FDF8F2` canvas — without changing **any** profile editing behaviour. Legacy mode must continue to render the current profile experience untouched.

## Current state (verified)

- `ProfilePage.tsx` already branches on `portalV2`. In Portal v2 it wraps the existing `ProfileLayout` (which renders its own `ProfileHeader` + cover-tinted background) inside `<PortalRail />` + `<PortalContextPanel />`.
- The result is *visually inconsistent* with other Portal v2 pages: it still shows the full-width tinted profile header bar, no Portal-style page title, and no shared `PortalPageShell` chrome.
- `ProfileLayout` renders `<AnnouncementBanner />`, `<ProfileHeader />`, then a 12-col grid that hosts `ProfileContent` (sidebar + main sections).
- `ProfileContent` is the **functional core**: `ProfileSidebar`, `AboutSection`, `ExperienceSection`, `AchievementsSection`, `EducationSection`, plus animations and a "Return to Dashboard" button.
- `ProfileHeader` carries critical actions via `ProfileHeaderActions` (share, settings, palette, guided setup, etc.).

## What changes (Portal v2 only)

Legacy branch (`!portalV2`) is **not touched**. All edits below are gated behind the existing `portalV2` flag.

### 1. New thin layout used only inside Portal v2

Create `src/components/profile/layout/ProfilePortalLayout.tsx` — a Portal-friendly replacement for `ProfileLayout` that:

- Drops the full-width tinted `ProfileHeader` bar (the Portal rail already provides nav + branding).
- Reuses `PortalPageShell` for the rail + canvas + context drawer chrome, with:
  - `eyebrow="Workspace"`, `title="Your profile"`, `subtitle` describing reflective + visibility purpose.
  - `actions={<ProfileHeaderActions … />}` so share / palette / settings / guided-setup all remain available, just relocated into the Portal header row.
- Renders `children` (the existing `ProfileContent`) inside the same 12-col grid the page uses today, so the sidebar + sections layout is preserved.
- Applies the cover/highlight color as a soft accent (border tints, section dividers) instead of repainting the whole canvas — Portal canvas stays warm `#FDF8F2`, matching every other Portal page.

### 2. `ProfilePage.tsx`

- In the `portalV2` branch, render `ProfilePortalLayout` (which internally uses `PortalPageShell`) instead of the current ad-hoc `<PortalRail /> + ProfileLayout + PortalContextPanel />` composition.
- Pass through every prop currently passed to `ProfileLayout` (cover color, highlight, palette callbacks, `userProfile`, etc.) — no behaviour loss.
- Keep `PostOnboardingChoice` modal and `ProfileFooter` exactly as today.
- Legacy branch unchanged.

### 3. `ProfileContent.tsx`

- Wrap each `content-section` (`AboutSection`, `ExperienceSection`, `AchievementsSection`, `EducationSection`) in the same rounded-3xl card surface used by `TileShell` — `rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm` with the warm shadow — but only when rendered inside Portal v2 (via a new optional `variant?: "legacy" | "portal"` prop, default `"legacy"`).
- Sidebar column keeps its current placement (lg:col-span-4 left). Card surfaces inside `ProfileSidebar` get the same Portal v2 treatment in `portal` variant.
- "Return to Dashboard" CTA at the bottom is replaced (in portal variant) with a subtle ghost link, since the rail already provides nav.
- All existing edit handlers (add/edit/remove for skills, languages, certs, experience, education, achievements; about text; cover/highlight color; palette; profile image upload) remain wired through unchanged.

### 4. `ProfileHeaderActions` reuse

- Render the existing `ProfileHeaderActions` component unchanged in the Portal header `actions` slot. Pass a "light" theme context (textColor = foreground, isDarkTheme = false) since the Portal canvas is warm cream, not the cover color.

### 5. Accent tinting

- Cover color and palette still drive small accents inside cards (icon chips, avatar ring, section heading underline) so users feel their personalisation. The page background stays the standard Portal cream — consistent with project memory rules ("No gray/purple backgrounds", DashboardLayout owns max-w / padding).

## Functional preservation checklist

- Edit name, title, location, phone, professional goal — via sidebar (unchanged).
- Add/edit/remove skills, languages, certifications — via sidebar (unchanged).
- Upload profile image — via sidebar (unchanged).
- Edit about text + biggest challenge — via `AboutSection` (unchanged).
- Add/edit/remove experiences, education, achievements — unchanged.
- Change cover color / highlight color / palette / mode — via `ProfileHeaderActions`, now in Portal header row.
- Share profile / open settings / guided setup — same `ProfileHeaderActions` menu.
- `PostOnboardingChoice` modal still triggers from existing effect.
- Legacy mode toggle floating pill still rendered by `PortalPageShell` (`showLegacyToggle` defaults to true).

## Files

**New**
- `src/components/profile/layout/ProfilePortalLayout.tsx`

**Edited**
- `src/components/profile/ProfilePage.tsx` — switch portalV2 branch to use `ProfilePortalLayout`.
- `src/components/profile/layout/ProfileContent.tsx` — add optional `variant` prop; portal variant wraps sections in Portal v2 card surfaces and tones down "Return to Dashboard".
- `src/components/profile/ProfileSidebar.tsx` — add same optional `variant` prop and apply Portal v2 card surface when variant is `"portal"` (no logic change).

No backend, no schema, no auth, no RLS changes.

## Out of scope

- Public/shared profile page (already updated previously via `SharedProfilePortalShell`).
- Legacy mode visuals.
- Mobile-specific reactive redesign of profile editing — current responsive behaviour is kept; a deeper mobile rework would be a separate task per the Lansa contextual-design doctrine.
