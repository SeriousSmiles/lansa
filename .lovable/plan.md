
# Real Stories — Make It Taller, Truly Scattered, and Fix the Glare

## What I’ll Change

- Rework `TestimonialsSection.tsx` so the desktop version behaves like the reference:
  - much taller section
  - sticky centered heading that stays faded behind the cards
  - cards placed with `position: absolute` inside a tall relative stage
  - user scrolls to reveal all cards progressively
- Keep the darker Lansa blue background and glossy card styling
- Correct the glare logic so it feels like a fixed light reflection, not a reversed or cursor-following hotspot

## Desktop Structure

Use a **tall scroll stage** instead of a normal grid.

```text
section
└─ relative tall stage (very large height)
   ├─ sticky centered heading layer (behind)
   └─ absolute card field layer (front)
      ├─ card 1 at custom top/left
      ├─ card 2 at custom top/right
      ├─ ...
      └─ card 8 lower in the stage
```

### Key layout changes
- Replace the current `grid-cols-4` layout with a `relative` stage using a custom `DESKTOP_CARD_LAYOUT` array
- Each card wrapper will have explicit desktop coordinates like:
  - `top`
  - `left`
  - optional small `rotate`
  - optional `translateY`
- Increase section height substantially, likely around `320vh–420vh`, so the user must scroll to uncover the full scattered composition
- Keep the heading centered with `sticky top-1/2 -translate-y-1/2`, low opacity, and behind the cards

## Card Positioning Approach

Instead of margin offsets, I’ll use a position map for all 8 cards.

Example approach:
- top row cards near upper stage
- middle cards offset left/right
- lower cards deeper in the section
- uneven placement so it feels editorial/scattered, not like a hidden grid

This will match the “floating cards over a long stage” effect better than the current layout.

## Tilt + Glare Fix

### Tilt
- Keep GSAP for card tilt
- Switch to a smoother GSAP pattern (`quickTo` / setters) so rotation feels premium and less jittery

### Glare
Current issue:
- glare direction feels reversed
- glare behavior does not match the expected fixed-light look

Planned fix:
- compute glare from the **tilt state**, not raw pointer position
- keep the glare anchored to a virtual light source
- adjust the sign/direction so the highlight shifts toward the visually correct edge of the card
- keep movement subtle and constrained so it reads as glossy reflection, not a spotlight chasing the cursor

## Visual Depth

- Preserve the large faded “Real Stories” title behind everything
- Add a few more soft blur layers in the background/foreground to strengthen depth
- Slightly vary card elevations/shadows so they feel suspended in space

## Mobile Behavior

Desktop is the priority here.

For mobile:
- keep a simple stacked/two-column version
- no absolute scattering
- no hover-dependent interaction
- preserve the same card styling and hierarchy

This follows Lansa’s contextual design rules:
- desktop = immersive, strategic, high-motion
- mobile = simpler, readable, action-light

## UX Intent

- **Desktop priority:** immersive visual storytelling
- **Hierarchy:** heading remains constant and atmospheric; cards become the moving content
- **Heuristic goal:** strong spatial clarity and recognition — users instantly understand they must scroll to discover more stories
- **Emotional outcome:** refined, premium, floating, cinematic

## File

| File | Action |
|---|---|
| `src/components/landing/TestimonialsSection.tsx` | Rewrite layout structure for tall sticky-heading stage, absolute scattered cards, and corrected GSAP glare behavior |

## Implementation Notes

- Remove the current desktop grid wrapper
- Replace `shouldOffset()` with a `DESKTOP_CARD_LAYOUT` config
- Increase desktop section height significantly
- Keep current testimonial data source (`TESTIMONIALS.slice(0, 8)`)
- Preserve avatar-at-top card design and glossy blue card treatment
