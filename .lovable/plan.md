

# Responsive Redesign — All /for-business Slides for Mobile & Tablet

## Problem
All slides except Hero render inside a fixed 1920x1080 `SlideRenderer` canvas that scales down via CSS transform. On mobile (< 768px) and tablet (768–1024px), content becomes tiny and unreadable with gray letterboxing.

## Approach

### 1. Bypass SlideRenderer on small viewports (PresentationShell.tsx)
Currently only `currentSlide === 0` bypasses `SlideRenderer`. Change to bypass for **all slides** when viewport is ≤ 1024px. Each slide will fill the available space and handle its own responsive layout.

- Add a `useIsTabletOrBelow` check (≤ 1024px)
- When true, render all slides directly (no `SlideRenderer` wrapper)
- When false (desktop), keep the 1920x1080 scaled renderer for slides 1-8

### 2. Per-slide responsive layouts

Each slide gets mobile (`< 768px`) and tablet (`768-1024px`) adaptations using Tailwind breakpoints. The desktop 1920x1080 layout stays untouched — responsive classes only activate below `lg:`.

**Slide 2 — ProblemSlide** (split-screen → stacked)
- Mobile: Full-bleed photo top (40vh), content below with stat cards as horizontal scroll
- Tablet: Photo top (35%), content bottom
- Headline font: `text-[32px]`/`text-[40px]` on mobile, `text-[44px]`/`text-[52px]` on tablet

**Slide 3 — HowItWorksSlide** (3-column → stacked cards)
- Mobile: Vertical scroll, each step is a full-width card with photo background
- Tablet: 3-column stays but with reduced padding and font sizes
- Header padding reduces from `px-[120px]` to `px-6`/`px-12`

**Slide 4 — CertificationSlide** (split-screen → stacked)
- Mobile: Photo hidden, full dark background with 2x2 grid becoming 1-column
- Tablet: Photo top (40%), content below, 2x2 grid preserved

**Slide 5 — FeatureShowcaseSlide** (alternating rows → stacked cards)
- Mobile: Single column, each feature is a full-width card (photo on top, text below)
- Tablet: Same alternating layout but narrower with reduced padding

**Slide 6 — FunnelSlide** (side-by-side → stacked vertical)
- Mobile: Traditional on top, Lansa below, each full-width with reduced typography
- Tablet: Side-by-side preserved but tighter padding and smaller fonts

**Slide 7 — IndustryInsightSlide** (split-screen → stacked)
- Mobile: Photo hidden, full dark background, interactive area fills screen, slider/select stays functional
- Tablet: Photo top (35%), interactive content below

**Slide 8 — PricingSlide** (side-by-side cards → stacked)
- Mobile: Cards stack vertically, full-width, reduced padding
- Tablet: Side-by-side preserved with narrower cards

**Slide 9 — CTASlide** (centered content)
- Already works reasonably well but needs font scaling: `text-[36px]`/`text-[44px]` on mobile, `text-[48px]`/`text-[56px]` on tablet
- Button padding and logo size reduced

### 3. Navigation adjustments for mobile
- Nav buttons (prev/next) stay at bottom corners but use smaller padding (`p-2`)
- Top bar stays as-is (already compact at 48px)

## Files to Change

| File | Change |
|---|---|
| `PresentationShell.tsx` | Add viewport detection; bypass `SlideRenderer` for all slides when ≤ 1024px |
| `ProblemSlide.tsx` | Add `flex-col lg:flex-row` layout, responsive typography and spacing |
| `HowItWorksSlide.tsx` | Add `flex-col lg:flex-row` for step cards, responsive padding/fonts |
| `CertificationSlide.tsx` | Add `flex-col lg:flex-row`, hide photo on mobile, responsive grid |
| `FeatureShowcaseSlide.tsx` | Stack features vertically on mobile, responsive alternating on tablet |
| `FunnelSlide.tsx` | Add `flex-col lg:flex-row`, stack comparison columns |
| `IndustryInsightSlide.tsx` | Add `flex-col lg:flex-row`, hide photo on mobile, responsive inputs |
| `PricingSlide.tsx` | Stack pricing cards vertically on mobile |
| `CTASlide.tsx` | Scale fonts and button sizes for mobile/tablet |

## Technical Details

- Use Tailwind responsive prefixes (`md:`, `lg:`) — no new hooks needed for per-slide layouts
- `PresentationShell` needs a hook for the `SlideRenderer` bypass decision (reuse `useIsMobile` pattern at 1024px breakpoint)
- All slides use `overflow-y-auto` on mobile to handle content that exceeds viewport height
- Desktop layout (inside `SlideRenderer` at 1920x1080) remains completely unchanged

