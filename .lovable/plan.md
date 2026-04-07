

# Redesign All /for-business Slides — Human-First, Designer Layout

## Overview

Transform every slide from the current "white card grid on white background" look into a **magazine-quality proposal** with split-screen photo layouts, dramatic typography (thin + black weight mixing), and stock imagery of real people. Add a new **interactive Industry Insight slide** that acts as a lead magnet.

## Current State → Target State

**Current**: All slides (2-8) are white backgrounds with centered content blocks, colored cards, and icon-heavy UI. Feels like a product spec, not a proposal.

**Target**: Each slide uses a distinct layout from a designer toolkit — half-bleed photos, full-bleed dark backgrounds with overlaid text, asymmetric grids, dramatic negative space. Typography mixes `font-extralight` (thin, large) with `font-black` (bold, punchy). Every slide has at least one human-centric stock photo.

---

## Slide-by-Slide Redesign

### Slide 1: Hero (Welcome) — NO CHANGE
Already redesigned with strip layout.

### Slide 2: Problem Slide
**Layout**: Split-screen — left 55% is a large photo (stressed manager reviewing paperwork), right 45% has the headline and 3 stat cards stacked vertically.
**Typography**: Industry headline in `font-extralight text-[72px]` with the key word in `font-black`. E.g., "Retail Hiring is *Broken*"
**Photo**: Industry-specific (retail manager, hotel lobby with understaffed desk, etc.)

### Slide 3: How It Works
**Layout**: Full-width, 3-column with each step having a background photo (person posting job, person browsing phone, handshake). Photo fills the card area with a dark gradient overlay, white text on top.
**Typography**: Step numbers in massive `font-extralight text-[120px]` watermark style behind each card. Titles in `font-black`.

### Slide 4: Certification
**Layout**: Keep dark background. Add a large photo on the left (person taking exam on tablet/laptop, 45% width). Right side has the sector grid (2x2). Add thin horizontal rules between elements for editorial feel.
**Typography**: Main headline split — "Every Candidate is" in `font-extralight`, "Lansa Certified" in `font-black`.

### Slide 5: Features
**Layout**: Alternating rows — each feature is a horizontal band. Odd rows: photo left, text right. Even rows: text left, photo right. Photos show the feature in action (person using wizard, analytics dashboard, team collaborating).
**Typography**: Feature titles in `font-black text-[36px]`, descriptions in `font-light`.

### Slide 6: Funnel Comparison
**Layout**: Keep the two-column comparison but add a background — left column gets a desaturated/red-tinted photo of chaotic office, right column gets a clean blue-tinted photo of calm professional at laptop. Text overlaid with semi-transparent card.
**Typography**: "Cut Screening Time by" in `font-extralight text-[56px]`, "80%" in `font-black text-[80px]`.

### Slide 7: NEW — Industry Insight Slide (Lead Magnet)
**Concept**: An interactive slide where the user answers ONE question specific to their selected industry. After answering, it reveals a surprising insight — something they weren't aware of — making the value of Lansa tangible.

**Per-Industry Design**:

| Industry | Question | Reveal Insight |
|---|---|---|
| **Retail** | "How many staff do you hire per year?" (slider: 5-100) | "At your scale, you're losing **XCG {calculated}** annually to bad hires. 1 in 3 leave within 90 days — Lansa's certification cuts that to 1 in 10." |
| **Hospitality** | "How many weeks before peak season do you start hiring?" (select: 2/4/6/8+) | "Hotels that start {X} weeks out fill only {Y}% of positions. With Lansa, average fill time drops from 42 to 5 days — start 2 weeks out and still be fully staffed." |
| **Tech** | "What % of your tech hires match their CV claims?" (slider: 20-100%) | "Industry average: only 55% deliver on claimed skills. Lansa Certified developers are pre-tested — 94% employer satisfaction on skill match." |
| **Healthcare** | "How long does your credential verification take?" (select: days/1wk/2wk/3wk+) | "Every extra week of verification = {X} shifts uncovered. Lansa pre-verifies credentials — candidates arrive ready to deploy." |
| **Finance** | "How many candidates do you screen per hire?" (slider: 10-100) | "At {X} candidates, you're spending ~{hours} hours screening. Lansa shows you only certified, pre-ranked matches — most hire within 5 reviews." |
| **Other** | "What's your biggest hiring frustration?" (select options) | Tailored insight based on selection with Lansa's specific solution. |

**Layout**: Split-screen — left side has a large atmospheric photo (person thinking, contemplating). Right side has the interactive question with a clean input, then animates to reveal the insight with a bold stat.

### Slide 8: Pricing
**Layout**: Full-bleed dark background (like CTA slide). Two pricing cards as frosted glass panels with backdrop-blur. Add a subtle background photo (team celebrating a hire, very dark overlay).
**Typography**: "Start Free." in `font-extralight text-[64px]`, "Scale When Ready." in `font-black`.

### Slide 9: CTA (Final)
**Layout**: Full-bleed photo background (diverse team of professionals, Caribbean setting). Dark overlay. Content centered.
**Typography**: "Ready to Hire" in `font-extralight text-[72px]`, "Smarter?" in `font-black text-[72px]`.

---

## New Slide Order (9 slides total)

1. Hero/Welcome (unchanged)
2. Problem (redesigned)
3. How It Works (redesigned)
4. Certification (redesigned)
5. Features (redesigned)
6. Funnel Comparison (redesigned)
7. **Industry Insight** (NEW interactive slide)
8. Pricing (redesigned)
9. CTA (redesigned)

---

## Files to Change

| File | Action |
|---|---|
| `PresentationShell.tsx` | Update `TOTAL_SLIDES` to 9, add new slide to render switch, pass `industry` to new slide |
| `SlideSidebar.tsx` | Add "Your Insight" to slide titles |
| `ProblemSlide.tsx` | Full redesign — split-screen photo layout, mixed-weight typography |
| `HowItWorksSlide.tsx` | Full redesign — photo-backed step cards, watermark numbers |
| `CertificationSlide.tsx` | Redesign — add left photo, split headline typography |
| `FeatureShowcaseSlide.tsx` | Full redesign — alternating photo-text rows |
| `FunnelSlide.tsx` | Add background photos to comparison columns |
| `PricingSlide.tsx` | Dark background, frosted glass cards, background photo |
| `CTASlide.tsx` | Full-bleed photo background |
| `IndustryInsightSlide.tsx` | **NEW** — interactive lead magnet with per-industry questions and calculated reveals |

## Technical Details

- All photos from Unsplash, people-focused, appended with `?w=1200&q=80` for performance
- Typography uses Urbanist `font-extralight` (100 weight) and `font-black` (900 weight) — verify Urbanist is loaded with these weights, add if needed
- Interactive slide uses local React state only — no backend needed
- Slider input styled with brand colors, animated reveal with CSS transitions
- All slides remain inside `SlideRenderer` (1920x1080 canvas) except Hero

