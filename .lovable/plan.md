## Goal
Turn mobile `/jobs` into a focused, immersive swipe surface: no page header, no bottom tab bar, and a more visual card that leads with the job image, shows compensation, and uses short callout-style AI bullets.

## Changes

### 1. Hide top header on mobile `/jobs`
`src/pages/LearningJobFeed.tsx`
- When `isMobile` is true, bypass `PortalPageShell` and render the mobile UI directly in a full-bleed container.
- Add a slim top bar: back button (left, `navigate(-1)`), the Discover/Saved segmented control (center, kept compact), and a Filter icon (right). No eyebrow, no title, no subtitle, no "Show Filters" button.
- Desktop continues to use `PortalPageShell` exactly as today.

### 2. Hide bottom nav on mobile `/jobs`
`src/components/mobile/app/BottomNav.tsx`
- Extend the existing hide rule (currently hides on active chat threads) to also hide on `/jobs`. Navigation off the page happens via the back button in the new top bar plus the JobDetailPanel apply flow.

### 3. Redesign the swipe card
`src/components/mobile/jobs/JobSwipeCard.tsx`
- Add a hero media block at the top of the card (`~38% of card height`):
  - Use `job.image_url` when present; otherwise a branded gradient (`from-primary/20 via-background to-secondary/20`) with the company logo centered.
  - Overlay company logo + name as a small chip in the bottom-left of the hero so identity persists when scrolling.
  - Overlay a compensation pill in the top-right (`job.salary_range`) with subtle styling (`bg-background/85 backdrop-blur`, small text, not bold) so it's present but not shouty.
- Body block:
  - Job title (kept extralight display).
  - Location · job type · Remote chip in a single tight row.
  - "AI Highlights" section with short callout bullets rendered as pill-style chips (2-column flow) instead of long paragraph bullets. Examples: "Remote-friendly", "Team-based", "Entry-level", "Tourism sector".
- Remove the bottom "Swipe right to save…" helper text (the action bar already conveys this) to give bullets more room.
- Keep the swipe overlays (INTERESTED / PASS) unchanged.

### 4. Shorten AI bullets to callouts
`supabase/functions/job-ai-summary/index.ts`
- Update the prompt: "Return 4-6 short callout phrases (2-5 words each, no sentences, no punctuation at end). Think tags a recruiter would put on a card: working style, seniority, sector, standout perk, key skill. Do not mention compensation."
- Add a server-side post-process: trim trailing periods, truncate each bullet to max 30 chars, drop empties, cap at 6.
- Bump cache key by adding `summary_version` check: if any bullet is longer than 40 chars (legacy long-form), regenerate. This avoids a manual cache wipe.
- Update fallback bullets to short form (e.g. `"Remote-friendly"`, `"Team role"`, top 2 skills as individual chips).

### 5. Hook adjustment
`src/hooks/useJobAISummary.ts` — no schema change; just ensure it still returns `bullets: string[]`. Card will render them as chips regardless of count.

## Out of scope
- No schema migration; the existing `ai_summary_bullets jsonb` column is reused.
- Desktop job feed layout untouched.
- JobDetailPanel content untouched (still opens on tap).

## Technical notes
- Hero image height: `aspect-[16/10]` capped so the card still fits within `min(72vh, 620px)` deck height.
- Compensation pill only renders if `job.salary_range` exists.
- Top bar uses `sticky top-0 z-40 bg-background/90 backdrop-blur` with `safe-area-inset-top` padding.
- BottomNav hide rule: `isActiveThread || pathname === '/jobs'`.
