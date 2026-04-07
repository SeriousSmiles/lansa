

# Replace HowItWorksSection with Scroll-Driven Stacking Cards (Layout408 Pattern)

## What Changes

Replace the current alternating grid layout in `HowItWorksSection.tsx` with a sticky scroll-driven stacking card interaction inspired by the Relume Layout408 component. As the user scrolls, each card stacks on top of the previous one, scaling down previous cards to create a depth effect.

## Technical Approach

Rewrite `HowItWorksSection.tsx` using only existing dependencies (`framer-motion`, `lucide-react`) — no Relume UI or clsx imports needed.

### Scroll Mechanics
- Wrap section in a tall container (`ref` for `useScroll`)
- Use `useScroll` with `offset: ["start start", "end 60%"]` to track progress
- Calculate per-card scale values: earlier cards scale to `0.8` as user scrolls past them, last card stays at `1`
- Each card is `position: sticky; top: 0` so they stack visually

### Card Layout
- Each card is a full-viewport-height sticky panel with a two-column layout (text + image)
- Alternating layout: odd cards flip text/image sides (same as current behavior)
- On mobile: single column, stacked vertically (no sticky behavior — just standard flow)
- Cards get white bg, `rounded-2xl`, `shadow-xl`, and `border border-primary/10`

### Content Preserved
- Same 3 steps: Build Your Profile, Get Certified, Connect & Get Hired
- Same images: `homepage5`, `homepage6`, `homepage7`
- Same icons: `UserPlus`, `Award`, `Briefcase`
- Same header block: "Simple by Design" tagline + heading + description
- Add a "Learn more" link-style button per card using `ArrowRight` icon from lucide

### Responsive
- Desktop: sticky stacking with scale transforms, two-column card content
- Mobile: standard stacked cards (no sticky), single column, simplified

## File

| File | Action |
|---|---|
| `src/components/landing/HowItWorksSection.tsx` | Rewrite — scroll-driven stacking card interaction |

