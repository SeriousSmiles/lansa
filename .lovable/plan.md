## Goal

Replace the current "campaign cut-out" landing approach with a Cashea + Klarna inspired layout system that uses a consistent story of realistic, happy people on phones/laptops. Hero stays untouched. Lansa branding (orange, deep blue, Urbanist + Public Sans) is preserved; layout/execution is reimagined freely.

## Design direction (inspired by cashea.app + klarna.com)

- **Big saturated color blocks** (Cashea): each section is a full-bleed band — warm off-white, deep blue `#191f71`, orange `hsl(14 90% 60%)`, soft cream — stacked like chapters.
- **Oversized black/white display headlines** with short, punchy copy (Cashea Spanish-style hierarchy → Papiamentu + English).
- **Hero-of-the-section product/people imagery** (Klarna): a single confident hero image per band — person holding a phone showing a Lansa screen, or sitting at a laptop — bleeding to the edge, never inside a rounded card.
- **Pill CTAs** (Klarna): solid black or solid orange, fully rounded, generous padding.
- **Tiny eyebrow label** above each headline (e.g. "FOR PROFESSIONALS", "GET CERTIFIED").
- **No more sketchy speech bubbles, no GSAP pinning, no parallax cut-outs.** Calm, editorial, scroll-stacked.

## Image system (the core ask)

Generate 8 realistic photos via the premium image model with consistent treatment:
- **Subjects:** different happy young Caribbean professionals (mix of genders, skin tones, 22–32) — never the same person twice, but same emotional register.
- **Props:** smartphone in hand OR sitting at a laptop. Half studio (clean cream/blue seamless backdrop), half lifestyle (soft daylight, café/desk/outdoor).
- **Lighting:** natural, soft, even — no harsh shadows, no moody color grading, no "AI gradient glow."
- **Wardrobe:** modern casual (knit, denim, blazer) — colors that sit next to orange/deep-blue without clashing.
- **Framing:** mostly 3:4 or 4:5 portrait for section heroes, one 16:9 for the final CTA band.

Saved to `src/assets/landing/people/` and replacing the current campaign-* assets, which get deleted.

Shot list:
1. Woman on couch smiling at phone — studio cream backdrop (Problem→Promise band)
2. Man at laptop in bright café, looking up confidently (Transformation step 1)
3. Woman at desk with phone, certificate visible on screen (Transformation step 2 — certified)
4. Man shaking hands / on video call on laptop (Transformation step 3 — discovered)
5. Close-up hands holding phone with Lansa app mock (Capabilities hero, Klarna-style)
6. Group of two friends laughing at a phone, outdoor daylight (Testimonials)
7. Woman in blazer at laptop, focused (Companies / Get Listed Early band)
8. Hero portrait, person mid-laugh, deep-blue seamless backdrop (Final CTA, 16:9)

## New page structure (Index, below Header83)

```text
[ Header83 hero — UNCHANGED ]

1. Trust strip                      cream band, small caps marquee (kept, restyled)
2. Value prop band                  WHITE — oversized headline left, photo #1 right (Klarna split)
3. How Lansa works                  CREAM — 3 stacked full-bleed rows, alternating image side
                                    (photos #2, #3, #4) — Cashea "chapters" feel
4. Capabilities                     DEEP BLUE band — big white headline, 2x2 feature tiles,
                                    photo #5 anchoring left column
5. Outcome / testimonials           WHITE — single large quote, photo #6 right, small logo row
6. Companies "soon" + Get Listed    ORANGE band — black headline, photo #7, pill CTA → /for-business
7. Lead magnet teaser               CREAM — "Know your worth" placeholder card, no image
8. Final CTA                        DEEP BLUE full-bleed — photo #8 as background with dark
                                    overlay, centered Papiamentu headline + pill CTAs
[ LandingFooter ]
```

All bands are full-bleed `w-screen`, content capped at `max-w-[1200px]` inside. Mobile: single column, image stacks above headline, same band colors.

## Other pages to align (light pass, same system)

- **Pricing.tsx** — hero band (cream, big headline, photo of person at laptop reusing #2), pricing cards on white, FAQ on cream.
- **ForBusiness.tsx** — deep-blue hero band, photo #7 right, Cashea-style alternating chapters for "Post a role / Browse certified / Hire."
- **Help.tsx** — cream hero with one friendly portrait, FAQ accordion below on white.

Hero on Index and any other page-specific hero components are untouched.

## Files

**New components** (replace existing landing/* below hero):
- `src/components/landing/ValuePropBand.tsx`
- `src/components/landing/HowItWorksChapters.tsx`
- `src/components/landing/CapabilitiesBand.tsx` (replaces CapabilitiesSection)
- `src/components/landing/TestimonialBand.tsx` (replaces QuoteTestimonials)
- `src/components/landing/CompaniesSoonBand.tsx` (replaces CompaniesSoonSection)
- `src/components/landing/FinalCTABand.tsx` (replaces FinalCTASection)
- Keep & restyle: `TrustStrip.tsx`, `LeadMagnetTeaser.tsx`

**Delete:** `ProblemPromiseSection.tsx`, `TransformationSection.tsx`, old `CapabilitiesSection.tsx`, `QuoteTestimonials.tsx`, `CompaniesSoonSection.tsx`, `FinalCTASection.tsx`, and the three `campaign-*.{png,jpg}` assets.

**Modified:** `src/pages/Index.tsx`, `src/pages/Pricing.tsx`, `src/pages/ForBusiness.tsx`, `src/pages/Help.tsx`.

**Generated assets:** 8 images in `src/assets/landing/people/` via `imagegen--generate_image` model `premium` (best realism for people).

## Technical notes

- No GSAP pins, no scroll-trigger parallax. Use Framer Motion only for simple `whileInView` fade/slide-up on headlines and images.
- Section component pattern: `<section class="w-screen bg-[token]"><div class="mx-auto max-w-[1200px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">…</div></section>`.
- Pill CTA utility: `rounded-full px-7 py-4 text-base font-semibold` in `bg-foreground text-background` or `bg-primary text-white`.
- Eyebrow label: `text-xs uppercase tracking-[0.2em] font-semibold text-primary`.
- All colors via existing semantic tokens — no raw hex in components.

## Open questions

1. Image scope now: generate all 8 in this build, or start with the 5 used on Index and add Pricing/ForBusiness/Help photos in a follow-up?
2. Photo casting — explicitly Caribbean / Curaçao representation (mixed Afro-Caribbean + Latino), or broader "global young professional" look?
3. Pricing/ForBusiness/Help — do the layout pass in this same build, or Index-only first and align the others next round?
