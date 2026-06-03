## Goal
Compensation must always be visible to the user — either on the swipe card or in the detail drawer. Today the card's compensation pill only renders when `job.salary_range` exists, and many listings (like the one in the screenshot) don't populate that field, so it disappears entirely from the card. Use the empty footer space at the bottom of the card to surface compensation reliably.

## Changes

### `src/components/mobile/jobs/JobSwipeCard.tsx`
1. **Resolve compensation with fallbacks**, in this order:
   - `job.salary_range`
   - Value parsed from `**Compensation:** …` in `job.description` (same regex already used in `JobDetailPanel`)
   - `"Compensation on request"` as last-resort label
2. **Remove the floating top-right compensation pill** on the hero (it competes with the company chip and disappears too easily on light images).
3. **Add a compensation row in the card footer**, replacing the current "Tap for details / Swipe to decide" hint line:
   - Left: `Wallet` icon + compensation value in `text-[12px] font-medium text-foreground`, with a small `text-[9px] uppercase tracking-wider text-muted-foreground` "Compensation" label above it.
   - Right: keep a single compact hint, e.g. `Tap for details →`, so the swipe affordance stays but the row reads primarily as compensation.
   - Container: `mt-auto pt-3 border-t border-border/50 flex items-center justify-between`.
4. Keep the rest of the card (hero, title, quick stats, Why it fits) unchanged.

### Drawer (`src/components/jobs/JobDetailPanel.tsx`)
No change required — it already parses and shows Compensation via `parseJobDescription`, and it also renders `job.salary_range` elsewhere. The drawer remains the full-detail surface.

## Out of scope
- Desktop job feed card.
- Schema changes; no new fields on `job_listings_v2`.
- Editing the AI summary function.

## Technical notes
- Parse helper lives inline in the card (small regex, no new file): `/\*\*Compensation:?\*\*\s*(.*?)(?=\n\*\*|\n\n|$)/i` against `job.description`.
- Always render the footer row so vertical rhythm of the card is consistent regardless of data completeness.
