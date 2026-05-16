# Slow down mobile hero zoom-out

## Goal
Make the Header83 hero's scroll-driven zoom feel slow and cinematic on mobile, matching desktop. Leave desktop behavior untouched.

## Root cause
In `src/components/hero/Header83.tsx`:
- Section height: `h-screen` on mobile, `md:h-[300vh]` on desktop.
- Sticky container: `md:sticky top-0` (sticky on desktop only).
- Progress math: `scrolled / max(rect.height - window.innerHeight, 1)`.

On mobile the section is exactly 1 viewport tall → divisor clamps to `1` → `sectionProgress` reaches 1 within a few pixels of scroll → the `scale 3.2 → 1` transform collapses almost instantly.

## Fix (single file, no logic changes elsewhere)
Edit `src/components/hero/Header83.tsx` only:

1. Give the section a tall runway on mobile too. Change:
   - `className="relative h-screen overflow-hidden md:overflow-visible md:h-[300vh]"`
   - to: `className="relative h-[250vh] overflow-visible md:h-[300vh]"`
   (Mobile gets ~1.5 viewports of scroll runway; desktop unchanged at 3vh.)

2. Make the inner container sticky on mobile too (so the visuals pin while the runway scrolls). Change:
   - `className="md:sticky top-0 h-[100svh] overflow-hidden"`
   - to: `className="sticky top-0 h-[100svh] overflow-hidden"`

3. Remove the dev-only `console.debug` block (no longer needed; was added to diagnose this exact issue).

That's it. The existing `useTransform([0,1], [3.2, 1])` keeps the same visual range, but now mobile has a real runway so the zoom plays out over ~1.5 screens of scroll instead of instantly.

## Why this is safe
- Desktop branch (`md:` classes) is unchanged → desktop look/feel preserved.
- No changes to opacity timings, images, copy, or downstream sections.
- `sticky` already works on mobile browsers; the parent section is now tall enough to allow it to pin.

## Out of scope
- No copy, layout, image, or animation-curve changes.
- No tweaks to other landing sections.
- No changes to Index.tsx.

## Verification
- Mobile (≤768): scrolling through the hero should take noticeably longer; images zoom out gradually as you scroll ~1.5 screen heights before the next section appears.
- Desktop (≥768): identical to today.
