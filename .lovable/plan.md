## Home Page Redesign Plan

The hero (`Header83`) stays exactly as-is. Everything below it gets rebuilt as a modern SaaS narrative aimed at **opportunity seekers**, with the warm, human, cut-out visual language from the attached Lansa social posts (orange tee guy, beige bg, blue/orange typographic accents).

### Design language (applies to all new sections)

- **Background:** warm off-white `hsl(40 33% 96%)` (matches campaign cream) with subtle paper texture, alternating with deep blue `#191f71` blocks for rhythm.
- **Type:** Urbanist Black/ExtraBold display, Public Sans body. Mix oversized blue display words with small caption-style labels (campaign style).
- **Imagery:** PNG cut-outs of people (no frames, no rounded image cards). Figures break the container — content stays in a `max-w-[1200px]` container, but hero PNGs extend full-bleed and overlap text edges.
- **Accents:** sketchy blue/orange "speech-bubble" SVG shapes echoing the campaign meme posts, used sparingly as section ornaments.
- **Motion stack:** GSAP + ScrollTrigger (already in project) for scroll-bound choreography (pinning, parallax, SplitText reveals, marquee). Framer Motion for component-level hover/tap. No new animation library — avoids conflict with existing GSAP. All scroll triggers cleaned up in `useLayoutEffect` returns; `gsap.context()` scoped per section to prevent leaks.

### New page structure (replaces everything after `Header83`)

```text
[Header83 — untouched]
1. Social Proof Strip      (logos / "soon" placeholder marquee)
2. Problem → Promise        (cut-out: confused guy / thumbs-up guy)
3. The Lansa Transformation (3-step scroll-pinned story)
4. Capabilities Showcase    (interactive feature cards w/ hover video-style reveal)
5. Outcome Proof            (testimonials reimagined, quote-poster style)
6. Companies Section        ("Soon revealed" + Get Listed Early CTA)
7. Lead Magnet Teaser slot  (placeholder section, copy TBD later)
8. Final CTA + Footer
```

### Section details

**1. Trust strip** — thin band under hero, GSAP horizontal marquee. Today shows "Trusted by Caribbean talent across 12+ industries" + 5–6 muted industry icons. Built so it can swap to real partner logos later without layout change.

**2. Problem → Promise** — split layout, container-width text, but the orange-tee "confused" PNG bleeds off the left edge full-bleed; on scroll a sketchy orange speech bubble draws in (GSAP `drawSVG`-style with `strokeDashoffset`). Right column: short "Realidat vs Ekspektashon" headline pair, then a single sentence promise. On scroll-out, "thumbs-up" PNG slides in from the right replacing the confused one (cross-fade + y-translate).

**3. The Transformation** — pinned section (`ScrollTrigger.pin`), 3 steps revealed sequentially: *Build your profile → Get certified → Get discovered*. Each step pairs a large numeral (display Urbanist Black, 12rem) with a cut-out figure breaking the container and a one-line capability description tied to a real in-app feature (Profile Builder, Certification Exam, Employer Discovery feed).

**4. Capabilities Showcase** — 4 large feature cards, container-width grid (2x2 desktop, stacked mobile). Each card has a static screenshot of the actual app surface (Profile / Resume editor / Certification / Discovery). On hover (desktop only): card lifts, screenshot subtly parallaxes, an accent sweep crosses the card (Framer Motion `whileHover`). Inspired by the NexGen reference — clean white cards on cream, oversized labels, single accent color per card (orange / blue / deep blue / sand).

**5. Outcome Proof** — reimagined testimonials as quote-posters matching the campaign style: huge blue display quote with orange offset shadow ("Bo no ta pèrdí."), small attribution underneath, cut-out portrait floating bottom-right. Horizontal scroll-snap on mobile, 3-up grid on desktop.

**6. Companies "Soon" + Get Listed Early** — full-bleed deep-blue band (`#191f71`). Left: oversized "Companies are coming." headline with an animated blurred/redacted strip across logo placeholders (GSAP shimmer). Right: short pitch + primary CTA **"Get listed early"** → `/for-business`. Secondary line: "Be among the first 25 employers on Lansa."

**7. Lead Magnet Teaser** — reserved section with placeholder copy ("Coming soon: a free tool to know your worth in the Curaçao market"). Built as a self-contained component so we can swap in the real lead magnet later without touching the page shell.

**8. Final CTA** — single oversized statement ("Bo ta buskando bo kaminda. Lansa ta yuda.") with Get Started + Sign In, on cream with cut-out figure breaking bottom edge into the footer.

### Technical details

- New components under `src/components/landing/`:
  - `TrustStrip.tsx`
  - `ProblemPromiseSection.tsx`
  - `TransformationSection.tsx` (GSAP pinned)
  - `CapabilitiesSection.tsx`
  - `QuoteTestimonials.tsx` (replaces current `TestimonialsSection` usage on home; old file kept untouched in case used elsewhere — will verify with rg before removing imports)
  - `CompaniesSoonSection.tsx`
  - `LeadMagnetTeaser.tsx`
  - `FinalCTASection.tsx`
- `Index.tsx` updated to compose the new sections; `Header83` block left byte-identical.
- Cut-out PNGs (orange-tee guy variants) copied from the uploaded campaign assets into `src/assets/landing/` and imported as ES modules. I'll background-remove if needed via existing image tooling.
- All colors via existing semantic tokens in `index.css` / `tailwind.config.ts`. No raw hex in components except the established `#191f71` token.
- Container rule respected: page content wrapped in `max-w-[1200px] mx-auto px-6`, but figure PNGs use absolute positioning + negative margins to break out, while their parent stays `overflow-hidden` to avoid horizontal scroll (per Dashboard Overflow Fix memory — `min-w-0` on grid children).
- GSAP usage pattern, per section:
  ```ts
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', { y: 40, opacity: 0, stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 75%' } });
    }, ref);
    return () => ctx.revert();
  }, []);
  ```
  Ensures no orphan ScrollTriggers, plays nice with Header83's existing Framer scroll listener.
- Mobile (per Lansa doctrine): pinning disabled below `md`, parallax reduced, cut-outs become inline (no container break) to avoid horizontal overflow. One primary action per screen, 44px+ tap targets.
- SEO: `SEOHead` on Index already in place — unchanged. Each new section uses semantic `<section>` + single `<h2>`; existing single `<h1>` in hero preserved.

### Out of scope (this round)

- Lead magnet logic/tool itself — only the teaser slot is built now.
- For Business / Pricing pages.
- Replacing real company logos (section ships in "soon" state by design).

### Open questions before I build

1. The "Companies coming soon" CTA — should clicking **Get listed early** go to `/for-business` (existing page) or open a lightweight email-capture modal? Pricing page exists too.
2. For the Capabilities section, are you OK with me capturing screenshots of the existing in-app surfaces (Profile, Resume editor, Certification, Discovery) and using them as static images, or would you prefer stylized illustrations?
3. The campaign quotes use Papiamentu ("Bo no ta pèrdí", "Mi ta bai hanja trabou awe"). Want the testimonials/final CTA bilingual (Papiamentu headline + English subline), or English only?
