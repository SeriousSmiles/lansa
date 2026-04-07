

# Hero Slide: Full-Bleed, Human-First, Responsive Strip Design

## Problem

1. **Gray letterboxing** — The HeroSlide renders inside a fixed 1920x1080 `SlideRenderer` canvas that scales down via CSS transform. On mobile/tablet viewports, this creates large gray bars above and below the slide content (visible in screenshots).
2. **Non-human imagery** — Current Unsplash photos show buildings, laptops, and interiors instead of people. The slide lacks warmth and human connection.
3. **Mobile/tablet strips are horizontal** — The vertical-column strip design works on desktop but becomes illegibly compressed on small screens. These need to become horizontal stacked strips on narrow viewports.

## Solution

### 1. Bypass SlideRenderer for HeroSlide

In `PresentationShell.tsx`, render the HeroSlide directly into the canvas area (not wrapped in `SlideRenderer`), so it fills 100% of the available space below the top bar. All other slides continue using the 1920x1080 scaled renderer.

```text
┌──────────────────────────┐
│  Top Bar (48px)          │
├──────────────────────────┤
│                          │
│  HeroSlide (100% fill)   │  ← No SlideRenderer wrapper
│                          │
│                          │
└──────────────────────────┘
```

### 2. Replace imagery with human-focused photos

Swap all 6 industry images with people-centric Unsplash photos:
- **Retail** — Smiling cashier/shopkeeper helping a customer
- **Hospitality** — Hotel staff greeting guests, waiter serving
- **Tech** — Developer pair-programming, team collaborating
- **Healthcare** — Nurse or doctor with patient, caring interaction
- **Finance** — Professional in office, team in meeting
- **Other** — Diverse group of professionals working together

### 3. Responsive strip layout

**Desktop (>1024px)** — Keep the current horizontal flex-row strips with hover-expand behavior. Unchanged.

**Tablet & Mobile (<=1024px)** — Switch to vertical stacked horizontal strips:
```text
┌──────────────────────────┐
│  LANSA FOR BUSINESS      │
├──────────────────────────┤
│ ████ RETAIL ████████████ │  ← horizontal strip, full width
├──────────────────────────┤
│ ████ HOSPITALITY ████████│
├──────────────────────────┤
│ ████ TECH ██████████████ │
├──────────────────────────┤
│ ████ HEALTHCARE █████████│
├──────────────────────────┤
│ ████ FINANCE ████████████│
├──────────────────────────┤
│ ████ OTHER ██████████████│
└──────────────────────────┘
```

Each strip: full-width, equal height (flex-1), background image with dark overlay, label left-aligned. Tapping a strip selects it (expands slightly with color reveal and tagline). No hover interaction on touch devices.

## Files to Change

| File | Change |
|---|---|
| `src/components/for-business/PresentationShell.tsx` | Conditionally render HeroSlide outside `SlideRenderer` when `currentSlide === 0` |
| `src/components/for-business/slides/HeroSlide.tsx` | Replace all 6 Unsplash URLs with human-centric photos; add responsive layout — `flex-row` on desktop, `flex-col` on mobile/tablet; adjust content positioning for horizontal strips on small screens |

## Technical Details

- **Responsive detection**: Use Tailwind's `flex-row lg:flex-row` / `flex-col` on the strip container
- **Mobile strip behavior**: Tap to select (toggle active state), no hover. Active strip gets `flex-[2]` expansion, color image, tagline reveal
- **Vertical text on mobile strips**: Remove `writing-mode: vertical-rl` — use horizontal left-aligned labels instead
- **Full bleed**: HeroSlide container uses `w-full h-full` directly in the canvas `div`, bypassing the 1920x1080 constraint

