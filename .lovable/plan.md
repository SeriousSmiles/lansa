## Problem (mobile, profile editor)

From the screenshot of the Achievements card on mobile:

- Header title wraps to two lines and the "Add Achievement" button text clips to "Add Achievem…".
- The section shell wraps an inner `Card` so we get **two stacked borders/shadows** — visually heavy and unlike a native app.
- The "Featured" pill floats above the card edge and collides with the date.
- Achievement title clips ("Top Ten Outstandin…") because the date column eats horizontal space.
- Edit / Feature / Delete actions are `opacity-0 group-hover:opacity-100` — on touch devices that means **no way to edit or delete an item**.
- Padding is desktop-sized (`p-6` outer + `p-5/p-7` shell), so each card consumes a full screen height for one entry.

The same pattern (double card, hover-only actions, header that doesn't fit on small screens) repeats across `AboutSection`, `ExperienceSection`, `EducationSection`, and `AchievementsSection`.

## Goal

On mobile, the profile editor cards should feel like a native iOS/Android app surface: one container per section, a tight header with an icon-only "+" affordance, full-width list rows, taps reveal actions, and content that wraps cleanly.

Desktop behavior stays exactly as it is today.

## Scope (presentation only)

Frontend / styling only. No data, schema, hooks, or business logic changes. No new components or routes.

Files touched:

- `src/components/profile/layout/ProfileContent.tsx` — collapse the redundant outer shell on mobile so we don't double-card.
- `src/components/profile/AchievementsSection.tsx` — header, item card, action visibility, featured pill.
- `src/components/profile/ExperienceSection.tsx` — header + item rows.
- `src/components/profile/EducationSection.tsx` — header + item rows.
- `src/components/profile/AboutSection.tsx` (and child `about/*` if needed) — header padding only.

## Changes

### 1. Section shell (ProfileContent.tsx)
- On mobile (`< md`): drop the outer wrapping div's border, shadow, rounded-3xl, and large padding. The inner `Card` already gives the surface.
- On `md+`: keep the existing portal shell exactly as is.
- Tighten vertical rhythm: `space-y-8` → `space-y-4 md:space-y-8`.

### 2. Section header (Achievements / Experience / Education)
- Outer card: `p-6` → `p-4 md:p-6`.
- Header row: switch to `flex items-center justify-between gap-3`, title `text-base md:text-xl`, icon avatar `w-9 h-9 md:w-10 md:h-10`.
- "Add" button on mobile: icon-only square (44px tap target) with `aria-label="Add achievement"`; full label only on `md+`. This kills the "Add Achievem…" clipping.

### 3. Achievement / Experience / Education item card
- Item padding: `p-4` → `p-3.5 md:p-4`; corner radius stays `rounded-xl`.
- Replace the floating "Featured" pill (`absolute -top-2 -right-2`) with an inline pill rendered next to the title — no overflow, no collision with the date.
- Title row stacks on mobile: title on its own line (no `line-clamp-2` truncation needed), date as a small muted line under the org. On `md+` keep the current side-by-side layout.
- Icon avatar: `w-10 h-10` on mobile, `w-12 h-12` on desktop.

### 4. Action affordances (the real bug)
- Remove the `opacity-0 group-hover:opacity-100` gating.
- On mobile: render a single overflow trigger (kebab `MoreVertical` icon, 44px target) at the top-right of the item that opens a `DropdownMenu` with **Feature / Unfeature**, **Edit**, **Delete**. This matches native app patterns and gives users an actual way to manage entries on touch.
- On `md+`: keep the inline ghost buttons but make them always visible at low opacity, lifting to full opacity on hover. No more invisible-until-hover dead zone.

### 5. Tokens / colors
- Replace the remaining `bg-yellow-*`, `text-yellow-500`, `dark:bg-yellow-900/30` etc. on the Featured state with semantic accent tokens (`bg-primary/10`, `text-primary`, `border-primary/30`). Stays on-brand (orange) and removes the ad-hoc yellow.
- Keep the typed icon color map but route it through token-based classes where the per-type color isn't critical (the small icon swatch can stay as-is — it's intentional variety).

### 6. Empty states
- Reduce empty-state vertical padding on mobile (`py-12` → `py-8 md:py-12`) so the card doesn't feel cavernous when there's nothing in it.

## Out of scope

- Modal / sheet redesign for "Add Achievement" — separate task.
- Sidebar (left column) layout.
- Dashboard / other pages.
- Any data, RLS, or edge function work.

## Verification

- Open `/profile` at mobile viewport: confirm single-border cards, header not clipped, "+" button visible and tappable, kebab menu opens Feature/Edit/Delete on each item, Featured pill sits inline, no horizontal scroll.
- Open `/profile` at desktop viewport: visually identical to today (portal shell + inline actions on hover).
- Re-run the same visual check on Achievements, Experience, Education, and About cards.
