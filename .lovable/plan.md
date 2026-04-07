

# Testimonials Section — Glossy Floating Cards with 3D Tilt

## What Changes

Rewrite `TestimonialsSection.tsx` to a Team22-inspired staggered grid layout with glossy, 3D-tilting testimonial cards on a Lansa Blue background. The heading sits behind the cards at a large scale, creating depth. Cards respond to mouse position with a tilt effect and reveal a glare/shine overlay.

## Visual Design

- **Section background**: Lansa Blue (`hsl(215 85% 55%)`) with subtle radial gradient highlights
- **Heading**: Very large, semi-transparent white text centered behind the card grid (using `absolute` positioning + low opacity), creating a "text behind cards" depth effect
- **Cards**: Lansa Blue tinted surface (`bg-white/10 backdrop-blur-md border border-white/20`) — glossy glass-morphism feel. White text throughout
- **Staggered grid**: Desktop uses the Team22 pattern — 4 columns with alternating `mt-12` offsets on specific indices so cards feel scattered/floating
- **Blur depth elements**: Decorative blurred circles (`bg-white/5 blur-3xl`) scattered behind the grid for atmospheric depth
- **Mobile**: 2-column grid, simplified, no tilt effect

## 3D Tilt + Glare Effect

Each card tracks `onMouseMove` relative to card center:
- `rotateX` and `rotateY` calculated from mouse offset (max ~8deg)
- A glare overlay `div` (white radial gradient, `pointer-events-none`) repositions based on mouse coords
- `onMouseLeave` resets to flat with a spring transition
- Uses `framer-motion`'s `motion.div` with `style={{ rotateX, rotateY, transformPerspective: 800 }}`

## Card Content

Use 8 testimonials from the existing data (mix from `leftColumn`, `rightColumn`, and `TESTIMONIALS`). Each card shows:
- Star rating (amber stars on the glass card)
- Quote text (white, `font-public-sans`)
- Name + role (white, `font-urbanist`)
- No avatar images (keep it clean like current cards)

## Stagger Pattern (Desktop)

Indices 1, 3, 7 get `mt-12` for vertical offset. Remaining cards sit flush. This creates the organic scattered layout from the Team22 reference. Cards use `will-change: transform` for GPU acceleration.

## File

| File | Action |
|---|---|
| `src/components/landing/TestimonialsSection.tsx` | Rewrite — glossy tilt cards, blue bg, staggered grid, depth blur |

