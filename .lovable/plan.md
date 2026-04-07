

# Fix Sticky "Real Stories" Heading

## Problem

The sticky heading doesn't stick because `overflow: hidden` on the `<section>` (line 164) prevents `position: sticky` from working. Sticky elements require an unclipped scroll ancestor — `overflow: hidden` creates a new scroll container that breaks this.

## Fix

1. **Remove `overflow-hidden`** from the `<section>` element (line 164)
2. **Move the decorative blur circles' clipping** to their own wrapper with `overflow: hidden` so they don't bleed outside, but the section itself remains unclipped
3. **Keep everything else identical** — card layout, GSAP animations, glare logic, mobile grid, colors

## Technical Detail

| Line | Current | Change |
|------|---------|--------|
| 164 | `className="relative overflow-hidden"` | `className="relative"` |
| 168 | blur wrapper `className="pointer-events-none absolute inset-0"` | Add `overflow-hidden` here instead |

That's the only change needed. The sticky element at line 178 will then work correctly against the browser viewport scroll.

## File

| File | Action |
|---|---|
| `src/components/landing/TestimonialsSection.tsx` | Move `overflow-hidden` from section to blur wrapper |

