# Mobile Job Swipe Deck (Hybrid Experience)

Add a Tinder-style swipe deck to the job seeker's mobile job browsing experience. Swipe right = interested (saved for later), swipe left = pass. Tapping a card opens the existing rich JobDetailModal/drawer so depth is preserved. Desktop `/jobs` is untouched.

## 1. Scope & Guardrails

- **Mobile only.** Triggered when `useIsMobile()` is true on `/jobs`. Desktop layout, `JobPostCard`, filters, and `MyApplications` stay exactly as-is.
- **No new top-level routes.** Reuse `JobFeed.tsx` tabs.
- **One visual system.** Reuse design tokens (orange/blue/warm canvas), no purple/gray, no "classic vs new" toggle.
- **No apply button on the card.** Apply happens from the saved list or detail drawer.

## 2. Animation Stack

- Use **Framer Motion** (already installed, v12). Industry standard for React swipe decks: declarative `drag`, spring physics, `AnimatePresence` for card exit, and `useMotionValue` for live rotation / overlay opacity.
- Do not introduce GSAP into this surface (kept for candidate swiping). No new deps.

## 3. UX Flow

`/jobs` mobile gets a 3-tab segmented control:

1. **Discover** — new swipe deck (default)
2. **Saved** — jobs the user swiped right on (new)
3. **Applications** — existing `MyApplications`

### Swipe deck
- Stack of up to 3 cards (top + 2 peeking behind, scale/offset).
- Drag horizontally with rotation + colored overlay:
  - Right drag: green "Interested" stamp, orange→green border glow.
  - Left drag: red "Pass" stamp.
- Release past threshold (≈30% width) or flick velocity → animate off-screen, record swipe, advance.
- Bottom action bar: ✕ (pass), ↺ (undo last, optional), ★ Save toggle for explicit tap, ✓ (interested). Keyboard arrow keys also work for accessibility.
- Tap card body → opens existing `JobDetailModal` (full depth: description, skills, company info, apply CTA).
- Empty state: warm illustration + "You're all caught up — adjust filters or check back tomorrow."

### Saved tab
- Grid/list of swipe-right jobs using current `JobPostCard` (reuses existing depth + Apply button).
- Each row has an "Unsave" action that deletes the swipe row.
- Empty state encourages swiping in Discover.

## 4. Card Anatomy (priority order, top → bottom)

1. **Job title** — largest, extralight display, primary emphasis.
2. **Company row** — logo (via `getJobLogo`) + company name, smaller.
3. **AI summary** — 3–5 bullets, clean spacing, generated on-demand (see §6). Shows skeleton shimmer while loading.
4. **Compensation** — present but understated: small pill ("XCG 3,500–4,500 / mo") in muted token, not bold, top-right of meta row.
5. **Meta row** — location, remote badge, job type — small text.
6. Subtle hint: "Swipe right to save · left to pass · tap for details".

No Apply button, no skills chip cloud (skills live in the drawer to keep the card calm).

## 5. Data: Saved Jobs

Reuse the existing `swipes` table with a new context value `'job'` and `job_listing_id` populated (table already supports this column).

- Right swipe → insert `{ swiper_user_id, target_user_id: job.business_id, direction: 'right', context: 'job', job_listing_id: job.id }`.
- Left swipe → same with `direction: 'left'`.
- Saved list query: `swipes` where `swiper_user_id = me AND context='job' AND direction='right'`, join `job_listings_v2` for display.
- Exclusion: discover deck filters out any job already swiped (any direction) by current user.
- Undo deletes the most recent swipe row for `context='job'`.

Migration needed only if `swipes.context` enum lacks `'job'` — will check and add via `supabase--migration` (separate approval step).

## 6. AI Bullet Summary (cached per job)

- New edge function `job-ai-summary`:
  - Input: `{ job_id }`.
  - Looks up job, if `ai_summary_bullets` column already populated → return it.
  - Else calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with tool-call schema returning `{ bullets: string[3..5] }` built from title + description + top_skills + location + salary_range.
  - Persists bullets back to `job_listings_v2.ai_summary_bullets jsonb` for reuse, returns to client.
- New column `ai_summary_bullets jsonb` on `job_listings_v2` (nullable), included in migration.
- Client: `useJobAISummary(jobId)` hook — fetches lazily when card is in the top-2 of the stack to keep next card ready. Falls back gracefully to first 3 sentences of `description` on failure.

## 7. Files

**New**
- `src/components/mobile/jobs/JobSwipeDeck.tsx` — stack + framer-motion drag logic.
- `src/components/mobile/jobs/JobSwipeCard.tsx` — single card (title, company, AI bullets, compensation, meta).
- `src/components/mobile/jobs/SwipeActionBar.tsx` — pass / undo / save / interested buttons.
- `src/components/mobile/jobs/SavedJobsList.tsx` — saved-tab list reusing `JobPostCard`.
- `src/hooks/useJobAISummary.ts` — fetch + cache bullets per job.
- `src/services/savedJobsService.ts` — wraps swipes table reads/writes for `context='job'`.
- `supabase/functions/job-ai-summary/index.ts` — edge function (Lovable AI Gateway, tool-call JSON output).

**Modified**
- `src/pages/JobFeed.tsx` — when `isMobile && activeTab==='discover'` render `<JobSwipeDeck/>` instead of the card list; add `'saved'` tab; keep all desktop paths intact.
- `src/services/jobFeedService.ts` — add helper to exclude already-swiped job IDs from the mobile discover feed.

## 8. Technical Details

- **Drag mechanics:** `<motion.div drag="x" dragConstraints={{left:0,right:0}} dragElastic={0.7}>`, `useTransform(x, [-200,0,200], [-15,0,15])` for rotation, separate transforms for left/right overlay opacity. Exit via `animate` to ±window.innerWidth with `transition={{duration:0.25}}` then unmount via `AnimatePresence`.
- **Performance:** Only top 3 cards mounted; `will-change: transform` on the top card; prefetch AI summary for cards 1–2.
- **Accessibility:** Buttons mirror swipe actions; `aria-live` announces "Saved" / "Passed"; honors `prefers-reduced-motion` by disabling drag rotation and using fade transitions.
- **Touch behavior:** `touch-action: pan-y` so vertical scroll inside the page works; horizontal swipe owns the card.
- **Empty / error / loading:** Skeleton card while jobs load; toast on save failure; offline-friendly (queues swipe insert and retries).

## 9. Out of Scope (not in this plan)

- Desktop swipe UI (explicit constraint).
- Notifications when a saved job is about to expire.
- Recommending similar jobs after a right swipe.

These can be follow-ups once the core experience ships.
