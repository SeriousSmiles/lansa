

# Landing Page Enhancement + Pricing Page

## 1. Transparent-to-Solid Navbar (`LandingNavbar.tsx`)

Add scroll-based state using `useState` + `useEffect` with a scroll listener. At `scrollY < 50`, navbar is transparent with white text/logo. After scrolling, it transitions to light background with dark text.

- Track `scrolled` boolean via `window.scrollY > 50`
- Conditional classes on `<nav>`: `bg-transparent` vs `bg-background/80 backdrop-blur-lg border-b`
- Nav links: `text-white/80` vs `text-foreground/70`
- Sign In button: `text-white` vs default
- Logo: apply `brightness-0 invert` filter when not scrolled (to make blue logo appear white)
- Mobile hamburger icon: `text-white` vs `text-foreground`
- Smooth CSS transition on all color/bg changes

## 2. Enhanced Landing Sections

### CaribbeanSection — Add metrics + richer copy
- Add 3 stat counters below the text (e.g., "500+ Certified Professionals", "50+ Partner Businesses", "12 Caribbean Nations")
- Upgrade description to highlight specific platform capabilities: AI profile generation, free CV, sector certifications, direct employer connections

### HowItWorksSection — Add visual polish
- Add subtle fade-in animations on scroll using framer-motion `whileInView`
- Add a brief sub-description under the section header
- Stronger step descriptions with outcome-focused language

### TestimonialsSection — More engaging header
- Add a tagline above the heading ("Real Stories")
- Slightly richer card styling with subtle hover elevation

### CTASection — Add secondary action + urgency
- Add a secondary "Learn More" link below the primary CTA
- Slightly adjusted copy for more emotional impact

### LandingFooter — Add "Pricing" link + social placeholders
- Add Pricing link to footer nav
- Add placeholder social media icons row

## 3. New Pricing Page (`src/pages/Pricing.tsx`)

A public standalone page at `/pricing` with:

### Hero area
- Tagline: "Simple Pricing"
- Heading: "Start Free. Scale When Ready."
- Sub: "No contracts, no hidden fees. Upgrade or cancel anytime."

### Two pricing tiers (reuse data from PricingSlide)
**For Professionals (Job Seekers):**
- **Free** — AI profile, CV generation, certification exams, job discovery
- **Pro (coming soon)** — Priority visibility, advanced analytics, premium badge

**For Businesses:**
- **Basic — Free** — 10 candidate swipes/month, job posting wizard, in-app messaging, Lansa Certified candidates
- **Premium — XCG 75/mo** — Unlimited swipes, AI candidate summaries, priority listings, hiring analytics dashboard

### Feature Comparison Table
A full-width responsive table below the cards comparing all features across tiers with check/x marks. Columns: Feature | Free | Pro/Premium. Uses the existing shadcn `Table` components.

### Bottom trust bar
- ShieldCheck icon + "Every candidate is Lansa Certified" message
- CTA button to sign up

### Technical
- Max-width `1440px` with `px-[5%]` matching all other sections
- Add route `/pricing` in `App.tsx`
- Add "Pricing" link to `LandingNavbar` and `LandingFooter`
- Wrap with `LandingNavbar` + `LandingFooter` for consistent chrome
- SEOHead with pricing-specific meta

## 4. Route Registration (`App.tsx`)
- Import and add `<Route path="/pricing" element={<Pricing />} />` in the public routes section

## Files

| File | Action |
|---|---|
| `src/components/landing/LandingNavbar.tsx` | Edit — scroll-based transparent→solid transition, add Pricing link |
| `src/components/landing/CaribbeanSection.tsx` | Edit — add stats, richer copy |
| `src/components/landing/HowItWorksSection.tsx` | Edit — scroll animations, stronger copy |
| `src/components/landing/TestimonialsSection.tsx` | Edit — add tagline, hover polish |
| `src/components/landing/CTASection.tsx` | Edit — secondary action, sharper copy |
| `src/components/landing/LandingFooter.tsx` | Edit — add Pricing link |
| `src/pages/Pricing.tsx` | Create — full pricing page with tier cards + comparison table |
| `src/App.tsx` | Edit — add `/pricing` route |

