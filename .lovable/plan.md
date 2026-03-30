

# Polish Landing Pages — Premium Design Overhaul

## Summary

Remove all gray/muted backgrounds from cards, sections, and hover states. Replace with Lansa brand-colored accents (warm orange tints, blue tints). Redesign the pricing page with a more complex, visually premium layout. Add motion polish across all sections. Hero section remains untouched.

---

## 1. Remove Gray Backgrounds Globally

### `src/index.css`
- Change `--accent` from `25 60% 95%` (grayish peach) to `14 90% 96%` (warm orange tint)
- Change `--muted` variable to a warmer tone: `14 30% 96%` instead of the current cold gray
- Ensure `--card` stays white (`0 0% 100%`)

### Components with `bg-muted` references to clean:
- **`HowItWorksSection.tsx`**: Remove `bg-muted/20` from section, remove `bg-muted` from image containers
- **`CaribbeanSection.tsx`**: Replace `bg-muted/30` on stat cards with a subtle orange-tinted border style
- **`TestimonialsSection.tsx`**: Remove gray `bg-card` on testimonial cards, use white with brand-colored left border
- **`Pricing.tsx`**: Remove `bg-muted/30` from table headers, remove `bg-muted/20` from trust bar, remove `bg-card` from tier cards

---

## 2. CaribbeanSection — Richer Visual

- Remove `bg-muted/30` from stat cards, replace with white background + subtle `border-primary/20` border + slight `shadow-sm`
- Add a warm gradient accent line or dot to each stat
- Use `motion` stagger on stat counters for entrance

---

## 3. HowItWorksSection — Clean + Vibrant

- Section background: pure white (`bg-background`) instead of `bg-muted/20`
- Image containers: remove `bg-muted`, use `shadow-lg rounded-2xl` with no background fill
- Add a subtle primary-colored vertical connector line between steps (desktop only)
- Add number badges with gradient (`lansa-gradient-primary`) instead of solid `bg-primary`

---

## 4. TestimonialsSection — Brand-Colored Cards

- Cards: white bg, no gray. Add a `border-l-4 border-primary` accent on left edge
- Hover: subtle `shadow-lg` elevation instead of gray background shift
- Star icons: use `fill-amber-400 text-amber-400` for warmth instead of `fill-primary`

---

## 5. CTASection — Keep, Minor Polish

- Already looks good with image background. Add subtle `backdrop-blur-sm` to the overlay for depth.

---

## 6. LandingFooter — Minor Polish

- Already dark. No gray issues. Add subtle social icon placeholders (Instagram, LinkedIn, Twitter) using lucide icons.

---

## 7. Pricing Page — Complete Redesign

Replace the current basic layout with a more premium, complex design:

### Structure:
1. **Hero** — Dark gradient background (Lansa blue-to-black) with white text. Centered heading + toggle for "Professionals / Businesses" tab switcher
2. **Tier Cards** — Full-width 2-column grid (not max-w-3xl). Cards have white bg, no gray. Highlighted card gets a `border-2 border-primary` with a floating "Most Popular" badge. Price numbers are large (text-5xl) with gradient coloring
3. **Feature Comparison** — Redesigned as a clean alternating-row table (white / very light orange tint rows, no gray header). Check marks use green circles, X marks are muted. Full width within 1440px container
4. **Trust Bar** — Replace gray bg card with a full-width gradient banner (primary orange-to-blue gradient at 10% opacity), with the ShieldCheck icon animated on scroll entry
5. **FAQ Accordion** — Add 4-5 common pricing questions below the trust bar using an accordion pattern

### Tab Switcher:
- A pill-style toggle at the top: "For Professionals" | "For Businesses"
- Uses `useState` to switch which tier cards + comparison table are shown
- Smooth `AnimatePresence` transition between the two views

### Visual Details:
- Tier cards: `rounded-3xl border-2` with generous padding (p-10)
- Feature list items: use `CircleCheck` icon (lucide) in primary color instead of plain `Check`
- Price: large bold number with `/mo` in muted smaller text
- CTA buttons: primary variant for highlighted, outline for others, full-width

---

## Files

| File | Action |
|---|---|
| `src/index.css` | Edit — warm up `--muted` and `--accent` tokens |
| `src/components/landing/CaribbeanSection.tsx` | Edit — remove gray bg, add brand borders + motion |
| `src/components/landing/HowItWorksSection.tsx` | Edit — remove all gray bg, add gradient badges + connector |
| `src/components/landing/TestimonialsSection.tsx` | Edit — brand-colored card borders, warm stars, no gray |
| `src/components/landing/CTASection.tsx` | Minor polish — backdrop blur |
| `src/components/landing/LandingFooter.tsx` | Edit — add social icons |
| `src/pages/Pricing.tsx` | Rewrite — premium layout with tab switcher, gradient hero, FAQ accordion |

