
## Mobile Candidate Card — AI Insight + Button Contrast + Tappable Card

### What's changing

Three focused fixes to `EnhancedCandidateCard.tsx`, `MobileCandidateBrowser.tsx`, and the action buttons in both the browser and `CandidateDetailSheet.tsx`.

---

### Problem 1 — AI Insight missing from card

The `matchSummaryService` already exists and is used in the desktop `LeftPanel`. The mobile `EnhancedCandidateCard` never calls it. The card currently shows: skills chips → bio snippet → goal → latest experience.

**Fix:** Replace the bio snippet + goal block in the card with an AI Match Insight section (Sparkles icon + tinted background, loading shimmer while fetching). The card needs `userId` (employer) passed in to call `matchSummaryService.getMatchSummary(userId, profile)`.

Card content becomes:
1. Skills chips (keep)
2. **AI Match Insight** — replaces bio + goal with a `Sparkles`-labeled block, tinted with `accentColor`, 2-3 lines max
3. Latest experience (keep)
4. "Tap to see full profile" button — moved to bottom

Since the card is rendered in a stack (positions 0, 1, 2), only the top card (stackPosition === 0) fetches the AI summary. The other two cards show a placeholder shimmer.

---

### Problem 2 — Button contrast on action row

The current buttons use `border-accent text-accent-foreground` for the Nudge (middle) button. `accent` is a low-contrast tinted color — on a white/light card background, the border and icon are barely visible (as shown in the screenshot with the faded middle circle).

**Fix:** Give each button an explicit, high-contrast color:
- **Pass (X):** `border-red-500 text-red-500` — already good, keep
- **Nudge (⚡):** Change to `border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white` — clear yellow/gold
- **Interested (♥):** `border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white` — clear Lansa Blue

Same fix applied to the `CandidateDetailSheet` sticky action buttons.

---

### Problem 3 — Whole card tappable + "Tap to see full profile" at bottom

Currently, "Tap to see full profile" is a small button mid-card. The `SwipeableContainer` wraps the card and handles drag — tapping the card body doesn't open the drawer.

**Fix:** 
- Move the "Tap to see full profile" hint to the very **bottom** of the card as a proper footer strip (full-width, `border-t`, `ChevronUp` icon, sticky within the card's flex layout).
- Make the entire **content body** area of the card (not the swipe handle area) trigger `onTapExpand` on tap — by adding an `onClick` handler to the content `div` that only fires if the swipe progress is near zero (i.e., not dragging). This avoids triggering the drawer mid-swipe.

---

### Files to edit

| File | Change |
|------|--------|
| `src/components/mobile/employer/EnhancedCandidateCard.tsx` | Add `userId` prop, fetch AI summary for top card, replace bio/goal with AI insight block, move tap button to bottom, make content area tappable |
| `src/components/mobile/employer/MobileCandidateBrowser.tsx` | Pass `userId` to `EnhancedCandidateCard` for top card |
| `src/components/mobile/employer/CandidateDetailSheet.tsx` | Fix Nudge button color contrast (amber) and Heart button (blue) |

---

### Card layout after changes

```text
┌─────────────────────────────────────────┐
│  [Cover banner — name, title, location] │
├─────────────────────────────────────────┤
│  Skills: [Tag] [Tag] [Tag]              │
│                                         │
│  ✦ Why this match?                      │
│  ┌─────────────────────────────────┐    │
│  │ "This certified professional    │    │
│  │  brings strong skills in X and  │    │
│  │  Y, aligned with your goals..." │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💼 Creative Specialist · Acme Corp     │
│                                         │
├─────────────────────────────────────────┤
│  ↑  Tap to see full profile             │  ← sticky footer, full width tappable
└─────────────────────────────────────────┘
```

---

### Technical notes

- The AI summary fetch uses `useEffect` gated on `stackPosition === 0` so only the front card loads the summary. `setIsLoadingSummary` drives a shimmer placeholder (3 lines of `animate-pulse bg-muted rounded`).
- The tap-to-open logic: `onClick={(e) => { if (swipeProgress < 0.1) { e.stopPropagation(); onTapExpand?.(); } }}` on the content body div prevents false triggers during swipe drags.
- The `userId` prop is optional on the card (`userId?: string`) so background stack cards (positions 1, 2) still render without it.
