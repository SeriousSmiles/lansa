## Goal

Make the dashboard canvas feel inhabited. Today the content sits in a narrow ~1040px centered column with large empty margins. We will:

1. Widen the canvas and let it breathe to the rail edges.
2. Keep the **Welcome Strip full-bleed** (no 2-col cage) and scale the greeting ~3x.
3. Introduce an **asymmetric 2-column layout** for everything below, segmented by visual priority (eye-tracking F-pattern: top-left = highest priority).

No new features. Pure spatial + hierarchy reorganization.

## Layout Model

### Canvas width
- Replace current `max-w-[1040px]` centered column with a wider `max-w-[1440px]` container that uses fluid horizontal padding (`px-6 lg:px-10 xl:px-14`).
- This pulls content closer to the rail and the right-panel trigger area, eliminating the "floating island" feeling.

### Zone A — Welcome Strip (full-bleed, single column)
- Keeps full canvas width. NOT inside the 2-col grid.
- Greeting scales ~3x: from `text-3xl md:text-5xl` → `text-6xl md:text-8xl lg:text-[9rem]`, tightened tracking (`tracking-[-0.04em]`), tightened leading (`leading-[0.95]`).
- Date eyebrow stays small. Insight subline stays one-line muted.
- Adds top breathing room (`pt-8 md:pt-14`) and a subtle bottom divider rule to mark the transition into the structured grid.

### Zone B — Asymmetric 2-column grid (everything below the welcome)
Grid: `lg:grid-cols-12 gap-6 xl:gap-8`.

```text
+-------------------------- Welcome Strip (full bleed) --------------------------+
|  SUNDAY, MAY 3                                                                 |
|  Good evening, John.   <-- scaled ~3x                                         |
|  Insight subline                                                              |
+--------------------------------------------------------------------------------+
+----------- LEFT (col-span-7) -----------+  +-------- RIGHT (col-span-5) -------+
|  Status Ribbon (3 chips, horizontal)    |  |  Today's Focus (hero card)        |
|  Your Portal                            |  |   - primary AI action             |
|  +------------+  +------------+         |  |                                   |
|  | Career     |  | Performance|         |  |  Recent Activity (compact list)   |
|  +------------+  +------------+         |  |   - last 5 items                  |
|  +------------+  +------------+         |  |   - "View all" -> right panel     |
|  | Visibility |  | Cert       |         |  |                                   |
|  +------------+  +------------+         |  |                                   |
+-----------------------------------------+  +-----------------------------------+
```

### Why this segmentation (eye-path reasoning)
- **F-pattern entry (top-left of grid)** = Status Ribbon. Quick "where do I stand?" snapshot. Highest scan priority.
- **Below it, dominant 2x2 Portal Grid** = the strategic working surface (Career / Performance / Visibility / Certification). Largest visual mass on the left, matching desktop "Strategic Mode".
- **Right rail (col-span-5)** = momentum column. Top: **Today's Focus** (the single decision/action). Below: **Recent Activity** (signal stream). This pairs the "what should I do next" with "what just happened" — the two reactive surfaces — and balances the heavier left mass.
- The right column is intentionally narrower (5/12) so the left feels like the "workshop" and the right like a "ticker tape" — preserves clear hierarchy instead of two equal walls.

### Density per Lansa doctrine
- Desktop = strategic; structured density allowed. Tiles keep their current internal density.
- Tile grid switches from `md:grid-cols-2` (full width) to `grid-cols-1 sm:grid-cols-2` *inside* the col-span-7 — so tiles stay 2-up but at a more comfortable card width (~320–360px each instead of ~500px).
- Today's Focus card becomes vertical-friendly (narrower, taller) — heading drops from `text-2xl` to `text-xl`, padding reduced from `p-8` to `p-6`. Still visually dominant via the orange glow.
- Activity list uses the existing compact row styling, capped at 5.

### Below large breakpoint (< lg, 1024px)
- Grid collapses to single column in this order: Welcome → Status Ribbon → Today's Focus → Portal tiles → Recent Activity. (Today's Focus jumps above tiles on mobile/tablet because it's the single next-action — matches mobile "Reactive Mode".)

## Technical Changes

Files to modify (no new files):

1. **`src/components/dashboard/portal/PortalShell.tsx`**
   - Change container: `max-w-[1040px]` → `max-w-[1440px]`, padding `px-5 sm:px-8 lg:px-12` → `px-6 lg:px-10 xl:px-14`.
   - Render `<WelcomeStrip />` outside the grid (full bleed).
   - Wrap the rest in `<div class="grid lg:grid-cols-12 gap-6 xl:gap-8 mt-8">`:
     - Left column `lg:col-span-7`: `StatusRibbon` + "Your portal" heading + tiles grid.
     - Right column `lg:col-span-5`: `TodaysFocus` + "Recent activity" heading + `ActivityStream` card.
   - Reorder for mobile via CSS `order` utilities so Today's Focus appears after Status Ribbon on small screens.

2. **`src/components/dashboard/portal/welcome/WelcomeStrip.tsx`**
   - `h1` size: `text-3xl md:text-5xl` → `text-6xl md:text-8xl lg:text-[9rem]`.
   - Tracking: `tracking-tight` → `tracking-[-0.04em]`.
   - Leading: add `leading-[0.95]`.
   - Add bottom spacing + a thin `border-b border-border/30 pb-8` to delineate from the grid below.

3. **`src/components/dashboard/portal/welcome/StatusRibbon.tsx`**
   - Keep `grid-cols-1 sm:grid-cols-3` (still horizontal in the 7-col left column — fits comfortably at ~700px+).
   - Remove `mt-6` (spacing now owned by `PortalShell`).

4. **`src/components/dashboard/portal/focus/TodaysFocus.tsx`**
   - Reduce hero padding from `p-6 md:p-8` → `p-6`, heading `text-xl md:text-2xl` → `text-xl`. Card now sits comfortably in the 5-col right column.
   - Remove its outer `mt-8` (spacing owned by parent grid).

5. **No changes** to tiles, ActivityStream, PortalRail, PortalContextPanel, or DashboardLayout.

## Acceptance

- Welcome greeting visually dominates the top of the canvas (~3x larger), full canvas width.
- Below the welcome, content fills the canvas with a clear 7/5 split — no large empty side margins on a 2048px viewport.
- Left column reads as the working surface (status + 4 tiles); right column reads as the action+signal feed (focus + activity).
- Below 1024px, layout collapses to a single column with Today's Focus prioritized after the status ribbon.
- All existing data, links, and panel triggers behave identically.