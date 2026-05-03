# Redesign: Premium Portal Dashboard (Seeker)

A complete visual + structural redesign of `/dashboard` into a true portal experience: persistent left navigation rail, focused central workspace, and a slide-in right context panel. Targets the seeker dashboard only; employer dashboard is untouched.

## Design intent

- **Cognitive state**: Strategic Mode (desktop) — the user is planning, configuring, reviewing.
- **Feeling**: "I am inside a premium operating system for my career," not "I am on a webpage with cards."
- **References**: Linear, Notion Calendar, Vercel dashboard, Apple Wallet — quiet luxury, generous whitespace, deliberate motion.
- **Brand**: Lansa Orange `hsl(14 90% 60%)` as the single accent, deep Lansa Blue `#191f71` for immersive headers, warm off-white `rgba(253,248,242,1)` canvas. No purple, no cold gray (per design system v2).

## Information architecture

Three persistent zones inside the existing `DashboardLayout`:

```text
+------------------------------------------------------------------+
| TopNavbar (existing — kept)                                      |
+--------+----------------------------------------------+----------+
|        |                                              |          |
|  Rail  |               Main Workspace                 |   Right  |
|  72px  |               (max-w content)                |   Panel  |
|        |                                              |   (slide |
|  icons |   - Welcome strip                            |   in)    |
|  +tip  |   - Status ribbon (3 KPIs)                   |          |
|        |   - Today's focus                            | Profile  |
|        |   - Portal grid (4 tiles)                    | / AI /   |
|        |   - Activity stream                          | Notifs   |
|        |                                              |          |
+--------+----------------------------------------------+----------+
```

### Left navigation rail (new)
- Width: `72px` collapsed (icon-only), `240px` expanded. User-toggleable, state in `localStorage`.
- Sections (vertical, with subtle dividers):
  1. **Workspace** — Overview, Career Plan, Story Builder
  2. **Visibility** — Profile, Certification, Listings
  3. **Discover** — Jobs, Resources, Content Library
  4. **Comms** — Messages, Notifications
- Active item: Lansa Orange 4px left bar + soft warm tint `hsl(14 90% 96%)`.
- Bottom: avatar + tier chip → opens the right Context Panel to the Profile view.
- Tooltips on hover when collapsed; full labels when expanded.

### Center workspace (rebuilt)
Five vertically stacked sections inside a `max-w-[960px]` column:

1. **Welcome strip** — Editorial typography: `font-extralight` greeting + `font-black` first name + small subline ("Sunday, May 3 · You're in Orange tier"). No card, just typography on canvas. Ties to `useUserState.color_auto`.
2. **Status ribbon** — 3 horizontal KPI chips (no cards): Profile completeness %, Certification status, Visibility status. Each is clickable and opens the relevant Context Panel view. Replaces the noisy 4-color analytics quadrant.
3. **Today's focus** — A single, AI-curated next action (sourced from existing `RecommendedActions` logic). One large soft card with Lansa Orange accent, primary CTA, and a "Skip / Snooze" affordance.
4. **Portal grid** — 2×2 grid of district tiles, each ~320px tall:
   - **Career Plan** (replaces `AICareerPlanCard`) — power skill preview + progress + "Open plan".
   - **Visibility & Interest** (merges `WhoIsInterestedSection` + `ListingActivationCard`) — listed/not listed state, count of recent interest, top 3 employer avatars.
   - **Performance** (compact `StudentAnalyticsCard`) — single hero metric (Match Rate %) with sparkline; tap to expand into Context Panel for the 4-stat detail.
   - **Certification** (`CertificationCard`) — current level, retake CTA, verification link.
   Each tile: `rounded-2xl`, `bg-card`, `shadow-[0_1px_0_hsl(0_0%_0%/0.04),0_8px_24px_-12px_hsl(14_90%_60%/0.18)]`, hairline border `border-border/40`, `hover:translate-y-[-2px]` micro-motion.
5. **Activity stream** — Compact timeline of recent platform events (matches, profile views, certification updates). Powered by `notifications` and `user_actions`. Collapsed to last 5; "View all" opens a sheet.

### Right Context Panel (new — replaces left ProfileCard)
A `400px` slide-in `Sheet` from the right that hosts secondary, deep content. Three views:

- **Profile** — restyled identity card (cover, avatar, completeness ring, primary action, "Edit profile", "Download PDF"). Replaces today's left ProfileCard, freeing the canvas.
- **AI Coach** — same content as today's `AICoachTab`, but lives here as drawer instead of a tab.
- **Insights** — full analytics with 4 stat tiles + match-rate ring + listed-since timeline.

Triggered by:
- Avatar in left rail (Profile)
- Status ribbon clicks (Insights)
- "AI Coach" item in rail (AI)
- A floating right edge handle when closed

State held in a small Zustand-style hook (`useDashboardPanel`) with `view` and `open`.

## Mobile behavior (must satisfy contextual design doctrine)

This is desktop-strategic. On mobile (`<lg`):
- Left rail collapses; navigation reuses the existing top nav.
- Right Context Panel becomes a full-screen `Sheet`.
- Portal grid becomes single-column stack.
- Status ribbon wraps to 2-up.
- Welcome strip shrinks (`text-3xl` not `text-5xl`).
- "Today's focus" stays prominent — it is the mobile entry point.

No new mobile patterns are invented. Mobile = reactive subset of desktop.

## Visual language

- Typography: `font-extralight` for hero greetings, `font-black` for the name, `font-medium` for tile titles, `font-normal` for body. Mix preserves brand voice.
- Color tokens (already in `index.css`): `--background`, `--card`, `--primary` (Lansa Orange), `--accent` (warm tint), `--muted`. No raw hex in components.
- Elevation: replace flat shadows with two-stop shadow `0 1px 0 black/4%, 0 8px 24px -12px primary/18%` for warmth.
- Radius: bump tiles to `rounded-2xl` (`16px`); chips and pills stay `rounded-full`.
- Motion: GSAP for the welcome strip stagger on mount; Framer Motion for tile hover and panel slide (spring 400/25 per mobile-experience-standards). One coherent timeline, never simultaneous animations on first paint.

## Technical approach

New files (all under `src/components/dashboard/portal/`):
- `PortalShell.tsx` — three-zone wrapper, drives the panel state, rail width.
- `PortalRail.tsx` — collapsible left rail with sections + active highlighting via `useLocation`.
- `PortalContextPanel.tsx` — right `Sheet` with view switcher (`profile` | `ai` | `insights`).
- `useDashboardPanel.ts` — small hook (`view`, `open`, `setView`, `close`).
- `welcome/WelcomeStrip.tsx` — typographic hero.
- `welcome/StatusRibbon.tsx` — three clickable KPI chips.
- `focus/TodaysFocus.tsx` — single recommended action surface.
- `tiles/CareerPlanTile.tsx`, `VisibilityTile.tsx`, `PerformanceTile.tsx`, `CertificationTile.tsx` — thin wrappers that wrap or re-render existing logic in the new visual shell. Where possible they import the existing component bodies and just rewrap presentation; data fetching stays unchanged.
- `activity/ActivityStream.tsx` — reads `notifications` + `user_actions`, dedupes, last 14 days, max 5 visible.

Files modified:
- `src/pages/Dashboard.tsx` — replace the current `grid-cols-[320px_1fr]` block with `<PortalShell>`. Keep all existing data-loading logic (`getUserAnswers`, `getProfileStatus`, AI insight, `track('dashboard_visited')`). The page stays the orchestrator; portal is purely presentational.
- `src/components/dashboard/DashboardTabs.tsx` — Overview tab replaced by the new portal layout. "Job Preferences" tab stays. "Story Builder" already hidden — leave hidden.

Files reused as-is (no changes):
- `StudentAnalyticsCard`, `CertificationCard`, `AICareerPlanCard`, `WhoIsInterestedSection`, `ListingActivationCard`, `AICareerPlanModal` — wrapped by new tiles, internal logic preserved.
- `ProfileCard` — moved into `PortalContextPanel` as the Profile view.
- `DashboardLayout`, `TopNavbar`, `AnnouncementBanner` — untouched.

No DB schema changes. No edge function changes. No new dependencies (Framer Motion, GSAP, lucide, shadcn already present).

## Heuristic checklist (per project doctrine)

- Visibility of system status: Welcome strip names tier; status ribbon shows three live signals; tile borders pulse softly when data updates.
- Match real world: rail labels are user-language ("Visibility", "Discover"), not internal terms.
- User control: rail collapses; panel closes; "Today's focus" is dismissible.
- Consistency: every tile uses the same shell, radius, shadow, padding.
- Error prevention: locked features (analytics before certification) show inline explanation, not a dead state.
- Recognition over recall: rail icons + labels; tile titles always visible.
- Aesthetic minimalist: max-width `960px` on workspace prevents the "endless wide grid" feeling on ultrawide monitors; aligns with the existing `1440px` outer constraint.

## Out of scope

- Employer dashboard (`/employer-dashboard`) — explicitly excluded.
- New backend data, new tables, new edge functions.
- Chat redesign, jobs feed redesign — only links from the rail.
- A/B test wiring; this ships as the new default.

## Rollout

Single PR. Gated behind a `dashboard_portal_v2` boolean in `localStorage` for the first 24h ("Try the new dashboard" toggle in the rail) so you can flip back during review. Default ON for everyone after sign-off.