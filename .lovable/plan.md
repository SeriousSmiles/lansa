# Complete Visitor Landing Page

## Overview

Keep the existing Header83 gallery hero as-is. Add 5 new sections below it to create a complete, polished landing page. Content will be rewritten to match actual Lansa platform capabilities. A shared Navbar and Footer will bookend the page.

## Page Flow (top to bottom)

```text
┌─────────────────────────────┐
│  Navbar (sticky)            │  ← New
├─────────────────────────────┤
│  Header83 (existing hero)   │  ← Keep as-is
├─────────────────────────────┤
│  Layout89 — "Built for the  │  ← New section
│  Caribbean"                 │
├─────────────────────────────┤
│  Layout249 — "How It Works" │  ← New section
│  3 steps                    │
├─────────────────────────────┤
│  Testimonial33 — Scroll-    │  ← New section
│  animated testimonials      │
├─────────────────────────────┤
│  CTA3 — "Your Career Starts │  ← New section
│  Here"                      │
├─────────────────────────────┤
│  Footer                     │  ← New section
└─────────────────────────────┘
```

## Section Details & Accurate Content

### 1. Navbar (`src/components/landing/LandingNavbar.tsx`)

- Sticky top navbar with Lansa logo, nav links (How It Works, For Business, Resources), and Sign In / Get Started buttons
- Mobile: hamburger menu with animated slide-down
- Links: "For Business" → `/for-business`, "Sign In" → `/login`, "Get Started" → `/signup`
- Uses framer-motion `AnimatePresence` for mobile menu

### 2. Layout89 — Value Proposition (`src/components/landing/CaribbeanSection.tsx`)

- Tagline: "For Us, By Us"
- Heading: "Crafted for Caribbean Dreams and Aspirations"
- Body: Rewritten to match actual platform — AI-powered profile builder, verified certifications, direct business connections, free CV generation
- Button: "Get Started Free" → `/signup`
- Full-width image placeholder (can use existing homepage assets)

### 3. Layout249 — How It Works (`src/components/landing/HowItWorksSection.tsx`)

- Tagline: "Simple by Design"
- Heading: "From Sign-Up to Hired — In Three Steps"
- **Step 1: "Build Your Profile"** — Sign up free, answer guided questions, and let AI craft your professional profile and CV instantly.
- **Step 2: "Get Certified"** — Take industry-specific certification exams to verify your skills and stand out to employers.
- **Step 3: "Connect & Get Hired"** — Employers browse certified talent, match with you, and reach out directly through the platform.
- Each step has a placeholder image area and numbered layout

### 4. Testimonial33 — Social Proof (`src/components/landing/TestimonialsSection.tsx`)

- Heading: "Everyone Took Their Step 1 — Once"
- Subheading: "Starting out can feel uncertain — Lansa makes it feel supported."
- Scroll-animated two-column testimonial cards using `useScroll` + `useTransform` from framer-motion
- Left column scrolls up, right column scrolls down (parallax effect)
- 6-8 testimonial cards with Caribbean-appropriate names and realistic quotes about the platform
- Star ratings, names, roles
- Responsive: on mobile, single column with vertical scroll animation

### 5. CTA3 — Final Call to Action (`src/components/landing/CTASection.tsx`)

- Heading: "Your Career Starts Here"
- Body: "Join Lansa today and take control of your professional future. Build your profile, earn certifications, and connect with businesses across the Caribbean."
- Button: "Sign Up Free" → `/signup`
- Dark background with full-width image overlay (gradient)

### 6. Footer (`src/components/landing/LandingFooter.tsx`)

- Lansa logo + brief tagline
- Newsletter email signup
- Links: Privacy Policy (`/privacy`), Terms of Service (`/terms`), Help (`/help`)
- Copyright: "© 2026 Lansa All rights reserved."
- Clean, minimal — matches brand aesthetic

## Files to Create/Edit


| File                                             | Action                                     |
| ------------------------------------------------ | ------------------------------------------ |
| `src/components/landing/LandingNavbar.tsx`       | Create — sticky navbar                     |
| `src/components/landing/CaribbeanSection.tsx`    | Create — value prop section                |
| `src/components/landing/HowItWorksSection.tsx`   | Create — 3-step process                    |
| `src/components/landing/TestimonialsSection.tsx` | Create — animated testimonials             |
| `src/components/landing/CTASection.tsx`          | Create — final CTA                         |
| `src/components/landing/LandingFooter.tsx`       | Create — footer                            |
| `src/pages/Index.tsx`                            | Edit — compose all sections below Header83 |


## Technical Approach

- Convert Relume JSX patterns to TypeScript, replace `@relume_io/relume-ui` Button with existing shadcn Button or keep relume where already installed
- Testimonial33 scroll animation: use `useScroll({ target, offset })` + `useTransform` for parallax columns — same pattern already used in Header83
- All `react-icons` usage replaced with `lucide-react` equivalents (Star icon for ratings, etc.)
- Navigation uses `useNavigate` from react-router-dom for internal links
- Fonts: `font-urbanist` for headings, `font-public-sans` for body — matching existing brand
- Colors: use existing CSS variables (`--primary`, `--secondary`, `hsl(215,...)` palette)
- Placeholder images: reuse existing `homepage-*.png` assets where appropriate