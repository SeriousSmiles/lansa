
## Goals

1. **Greeting** feels confident, not billboard-loud — reduce one scale step.
2. **"Your Portal"** earns its space: above-the-fold, no redundant info, no forced scroll to see the four districts.

## Problem analysis

Looking at the current `/dashboard` (screenshot + code review):

- `WelcomeStrip` greeting renders at `lg:text-[9rem]` (~144px) — visually overwhelms the canvas.
- `StatusRibbon` (Profile / Certification / Visibility chips) **duplicates** signals already shown by `VisibilityTile` ("Your Profile is Live") and the certification/visibility states baked into other tiles.
- `VisibilityTile` embeds the entire `WhoIsInterestedSection` list (7+ employer rows) inside a single tile — it grows tall, stretches the left column, and forces the other 3 tiles to expand awkwardly or pushes content far below the fold.
- `CertificationTile` and `PerformanceTile` are dense secondary surfaces that don't need to be visible the moment the user lands — they're "deeper inspection" surfaces.
- Result: tiles feel "out of place" because they're competing for primacy at equal weight in a flat 2x2 grid.

## Changes

### 1. Greeting scale (WelcomeStrip)

Drop one tier across breakpoints:

- `text-6xl md:text-8xl lg:text-[9rem]` → `text-5xl md:text-7xl lg:text-[7rem]`
- Tighten top padding `pt-8 md:pt-14` → `pt-6 md:pt-10`
- Date eyebrow and insight paragraph stay as is.

### 2. "Your Portal" — restructure to a *Primary + Quick-Switch* model

Replace the flat 2x2 tile grid with a **single primary working surface** plus a compact **district switcher**, so the four districts coexist without stacking vertically.

```text
┌─ Your portal ──────────────────────────────────────────────┐
│  [ Career ] [ Visibility • 7 ] [ Performance ] [ Cert ]    │  ← segmented switcher
│ ──────────────────────────────────────────────────────────  │
│                                                             │
│   Active district panel (one of the four tiles, expanded)   │
│   — full tile content lives here, no inner cropping         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Default active district: **Career plan** (primary growth surface).
- Switcher is a horizontal segmented control (pill buttons) showing each district's name + a tiny status dot/count (e.g. Visibility shows the live interested-count badge).
- Switching is instant client-side (local state inside `PortalShell`); no route change.
- The active panel renders the same component currently used by the corresponding tile, but **without** the `TileShell` chrome — so it gets full breathing room inside the unified card.
- Eliminates the "Visibility tile is huge, others are stubby" imbalance.

### 3. Remove `StatusRibbon` from the canvas

The three chips are redundant with the district switcher (which already labels Career / Visibility / Performance / Certification with live status) and with `VisibilityTile`'s "Your Profile is Live" header.

- Move "Profile completeness %" to a small inline meter under the greeting insight line (one row, no chrome) — it's the only chip not represented elsewhere.
- Delete the rest of the ribbon usage from `PortalShell`. Keep the file in case it's reused later.

### 4. Right column unchanged in structure

`TodaysFocus` + `Recent activity` stay in the right `lg:col-span-5`. They already feel right.

### 5. Layout grid tuning

- Left column stays `lg:col-span-7`. With only one active district panel instead of a 2x2 grid, vertical height roughly matches `TodaysFocus + Recent activity` on the right — eliminates the awkward bottom whitespace and the forced scroll.
- Maintain `min-w-0` rules.

## Technical details

**Files edited**

- `src/components/dashboard/portal/welcome/WelcomeStrip.tsx` — scale down headline + add optional `completeness` prop rendered as a slim inline progress line.
- `src/components/dashboard/portal/PortalShell.tsx` — replace 2x2 grid with `PortalDistricts` switcher; remove `StatusRibbon`; pass profile completeness to `WelcomeStrip`.
- `src/components/dashboard/portal/tiles/PortalDistricts.tsx` *(new)* — segmented switcher + active-panel renderer. Reuses existing `AICareerPlanCard`, `ListingActivationCard` + `WhoIsInterestedSection`, `PerformanceTile` body, `CertificationCard` directly (without `TileShell`). Fetches the same lightweight signals (cert state, visible flag, interested count) once to label the switcher.
- `src/components/dashboard/portal/welcome/StatusRibbon.tsx` — left in place but no longer mounted in `PortalShell`.

**No changes to**

- Route, layout shell (`DashboardLayout`), portal rail, context panel, classic-view toggle.
- `TodaysFocus`, `ActivityStream`.

## Out of scope

- Mobile portal redesign (this is desktop strategic mode per doctrine; mobile already collapses to single column).
- Any data model changes.
