

# B2B Interactive Proposal Brochure — Build Plan

## Concept

A **presentation-style landscape experience** at `/for-business` (public route). Visitors must enter an access phrase ("Get Candidates" — case-insensitive) before seeing content. Once unlocked, the experience renders as a **landscape slide deck** with:

- **Left sidebar** (retractable): slide thumbnails / page selector
- **Main canvas**: landscape presentation slides, one at a time
- **Right sheet**: expands when a card is clicked, showing deeper detail
- **Fullscreen mode**: via button toggle (Fullscreen API)
- **CTA**: "Create Your Account" links to `/signup`

---

## Architecture

### Access Gate
- Simple full-screen input field with Lansa branding
- `useState` stores the phrase; validated against the 4 accepted variants (case-insensitive comparison via `.toLowerCase() === "get candidates"`)
- Gate state stored in `sessionStorage` so refreshing doesn't re-prompt

### Slide System (NOT the Shadcn sidebar — custom lightweight)
- All slides render at a fixed **1920x1080** coordinate space
- Scaled to fit viewport via `transform: scale(Math.min(containerW/1920, containerH/1080))`
- Navigation: left/right arrow keys, on-screen next/prev buttons, sidebar thumbnail click
- `useState` for `currentSlide` index

### Left Sidebar (Page Selector)
- Retractable panel (toggle button visible when collapsed)
- Shows numbered thumbnail previews of each slide
- Active slide highlighted
- Collapses to a thin strip with a hamburger/arrow toggle

### Right Detail Sheet
- Uses existing `Sheet` component (side="right")
- Triggered when user clicks an expandable card on any slide
- `useState` for `detailContent` — sets the sheet's content dynamically
- Sheet shows the "deep dive" info for that card

### Fullscreen
- Button in top-right corner (Expand icon)
- Uses `document.documentElement.requestFullscreen()` / `exitFullscreen()`
- Listen to `fullscreenchange` event to sync state

---

## Slides (8 slides)

### Slide 1 — HERO / TITLE
- AnimatedLogo (large, centered)
- "LANSA FOR BUSINESS"
- Subtitle: "Verified Talent. Smarter Hiring. Built for the Caribbean."
- Industry selector chips (Retail / Hospitality / Tech / Healthcare / Finance / Other) — sets state used by Slide 2
- Subtle animated gradient background using Lansa brand colors

### Slide 2 — THE PROBLEM (dynamic by industry)
- Headline: "Your Hiring Challenge"
- 3 pain-point cards that update copy based on selected industry from Slide 1
- Each card is clickable — opens right sheet with expanded detail
- Animated "hours wasted per hire" counter stat

### Slide 3 — HOW LANSA WORKS
- 3-step visual flow: Post → Browse → Match
- Clean iconography with step numbers
- Each step card expandable (right sheet) for deeper detail
- "5 minutes to post. Seconds to match."

### Slide 4 — THE CERTIFICATION DIFFERENCE
- Visual of the 4 certification sectors (Office / Service / Technical / Digital)
- Headline: "Every candidate is Lansa Certified"
- Expandable cards per sector showing what's assessed
- Badge/certificate visual element

### Slide 5 — FEATURE SHOWCASE
- 4 feature cards in a 2x2 grid:
  1. Job Posting Wizard
  2. Smart Candidate Discovery (swipe matching)
  3. Hiring Analytics Dashboard
  4. Team & Organization Management
- Each card clickable → right sheet with full feature detail + benefit copy from the report

### Slide 6 — HIRING FUNNEL COMPARISON
- Split visual: "Traditional Hiring" vs "Hiring with Lansa"
- Traditional: many steps, red/slow indicators
- Lansa: streamlined funnel, green/fast indicators
- Key stat: "Cut screening time by up to 80%"
- Animated on slide entry (CSS transitions)

### Slide 7 — PRICING
- Two plan cards side by side: Basic (Free) vs Premium (XCG 75/mo)
- Basic: 10 swipes/month
- Premium: Unlimited swipes, AI Summaries, Priority Listings
- Universal note: "All candidates are Lansa Certified on every plan"
- "Start Free" emphasis
- Expandable cards for detail

### Slide 8 — CTA / CLOSE
- "Ready to hire smarter?"
- Large CTA button → `/signup`
- Secondary: "Questions? Contact us"
- AnimatedLogo
- Subtle social proof placeholder area

---

## Interactive Elements Summary

| Element | Mechanism | Location |
|---|---|---|
| Access phrase gate | `useState` + `sessionStorage` | Before all content |
| Industry selector | `useState`, updates Slide 2 copy | Slide 1 |
| Expandable cards | Click → `Sheet` (right side) with detail content | Slides 2-7 |
| Slide navigation | `useState(currentSlide)`, arrow keys, sidebar clicks, next/prev buttons | Global |
| Sidebar toggle | `useState(sidebarOpen)` | Left panel |
| Fullscreen | Fullscreen API + state sync | Top-right button |

---

## Files to Create

| File | Purpose |
|---|---|
| `src/pages/ForBusiness.tsx` | Top-level: access gate + presentation shell |
| `src/components/for-business/AccessGate.tsx` | Phrase input screen with branding |
| `src/components/for-business/PresentationShell.tsx` | Sidebar + canvas + navigation + fullscreen |
| `src/components/for-business/SlideRenderer.tsx` | Scale wrapper (1920x1080 → viewport) |
| `src/components/for-business/SlideSidebar.tsx` | Retractable left sidebar with thumbnails |
| `src/components/for-business/DetailSheet.tsx` | Right-side Sheet for expanded card content |
| `src/components/for-business/slides/HeroSlide.tsx` | Slide 1 |
| `src/components/for-business/slides/ProblemSlide.tsx` | Slide 2 (dynamic by industry) |
| `src/components/for-business/slides/HowItWorksSlide.tsx` | Slide 3 |
| `src/components/for-business/slides/CertificationSlide.tsx` | Slide 4 |
| `src/components/for-business/slides/FeatureShowcaseSlide.tsx` | Slide 5 |
| `src/components/for-business/slides/FunnelSlide.tsx` | Slide 6 |
| `src/components/for-business/slides/PricingSlide.tsx` | Slide 7 |
| `src/components/for-business/slides/CTASlide.tsx` | Slide 8 |
| `App.tsx` | Add `/for-business` public route |

---

## Branding

- **Font**: Urbanist (already loaded)
- **Primary**: Lansa Blue `hsl(215 85% 55%)` — trust, professionalism
- **CTA accent**: Lansa Orange `hsl(14 90% 60%)` — energy, action
- **Backgrounds**: White / soft blue-grey gradients per slide
- **Logo**: `AnimatedLogo` component (animated heatmap shader)
- **Slide aesthetic**: Clean, spacious, presentation-grade — not a web page. Large type, bold visuals, minimal text per slide. Detail lives in the right sheet, not on the slide face.

---

## Technical Notes

- No authentication required — public route, gated only by access phrase
- No Supabase calls — all content is static/hardcoded
- Uses existing `Sheet` component for right-side detail panels
- Keyboard navigation: Left/Right arrows, Escape to exit fullscreen
- Mobile: slides still scale down via the transform approach; sidebar becomes a bottom sheet or overlay

