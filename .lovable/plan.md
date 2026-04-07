

# Testimonials Section — Darker Blue, Avatar Images, Scroll Effect, Fixed Glare

## What Changes

1. **Darker blue background** — switch from `hsl(215 85% 55%)` to a deeper `hsl(215 85% 40%)`
2. **Add square avatar image** at the top of each card (like the Team22 reference), using avatars from `testimonials.ts`
3. **Make section taller** with scroll-driven stagger entrance (cards animate in as user scrolls into view)
4. **Fix glare effect** — glare should be positional (based on tilt angle), NOT follow the cursor. The glare stays fixed relative to a "light source" and only shifts as the card tilts, creating a realistic holographic/glossy feel
5. **Use GSAP** for the 3D tilt + glare interaction (replacing framer-motion tilt logic) for smoother, more performant animation

## Glare Behavior (Key Fix)

The current implementation moves the glare radial gradient to match cursor position — that's wrong. The correct behavior:
- The glare represents a fixed light source (top-left or top-center)
- As the card tilts via mouse position, the glare shifts slightly in the *opposite* direction of the tilt, simulating light reflection off a glossy surface
- The glare position is derived from the card's `rotateX`/`rotateY` values, not the raw mouse coordinates
- This creates the "holographic card" effect seen in the reference video

## Card Design Update

Each card will now include:
- **Square avatar image** at top (aspect-square, rounded-xl, object-cover) — pulled from the `avatar` field in `TESTIMONIALS` data
- Star rating below the image
- Quote text
- Name + role

Use 8 testimonials from `TESTIMONIALS` array (which has proper avatar URLs).

## Scroll Entrance Animation

- Section gets more vertical padding (`py-28 md:py-36`)
- GSAP `ScrollTrigger` staggers the cards in on scroll (fade up + slight scale, 0.1s stagger per card)
- This makes the section feel longer and more immersive as user scrolls through

## Technical Approach

- **GSAP** with `ScrollTrigger` for scroll-triggered entrance animation
- **GSAP** `quickTo` or direct event handlers for 3D tilt on mouse move
- Glare overlay uses CSS `background` with radial gradient, position computed from tilt angles
- Cards use `transform-style: preserve-3d` and `perspective` on parent
- Keep framer-motion import only if needed elsewhere; tilt logic moves to GSAP

## File

| File | Action |
|---|---|
| `src/components/landing/TestimonialsSection.tsx` | Rewrite — GSAP tilt/glare, avatars, darker blue, scroll entrance |

