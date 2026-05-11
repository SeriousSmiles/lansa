
# People-Based Image Slots — Seeker Dashboard

Bring the human, people-first brand feeling back into the new portal by introducing intentional, layout-aware decorative image slots. The slots are placeholders today (clearly marked, gradient + label) and ready to receive real images later — drop in a file, swap a prop, done. No business logic changes.

## Approach

One reusable primitive + four named placements that integrate with the existing `PortalShell` zones. Each slot is "decor with a message" — image on one side, short headline + supporting line on the other — so the photo never floats alone, it always carries narrative weight (the LinkedIn-style reference you shared).

The slots are designed to:
- Blend into the warm `bg-[rgba(253,248,242,1)]` canvas (rounded-3xl, subtle border, soft shadow)
- Respect Desktop = strategic / Mobile = reactive (slots collapse to single-column, image first or hidden where it would compete with a primary action)
- Never push primary CTAs below the fold
- Be drop-in: pass `src` + `headline` + `body` + optional `eyebrow` + `tone`

## New primitive

`src/components/dashboard/portal/decor/BrandImageSlot.tsx`
- Props: `src?`, `alt`, `eyebrow?`, `headline`, `body?`, `cta?` (label + onClick/href), `aspect` (`"wide" | "portrait" | "square"`), `tone` (`"cream" | "ink" | "accent"`), `placement` (`"image-left" | "image-right" | "image-top"`), `priority?` (controls mobile visibility: `always | desktop-only`)
- Empty state: dashed border, brand gradient wash, centered "Image slot — [aspect]" label and dimension hint so you know exactly what to drop in
- Filled state: `<img>` with `loading="lazy"`, rounded, paired text block
- Uses semantic tokens only (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border/40`, `bg-primary/5`)

## Placements in `PortalShell`

```text
┌──────────────────────────────────────────────────────────┐
│ WelcomeStrip (greeting)                                  │
│  └─ SLOT 1: hero ribbon (wide, image-right)  ← NEW       │
├──────────────────────────────────────────────────────────┤
│ ProfileCompletionCard (only if incomplete)               │
├──────────────────────────────────────────────────────────┤
│ LEFT (col-span-7)         │ RIGHT (col-span-5)           │
│  PortalDistricts          │  TodaysFocus                 │
│                           │                              │
│  SLOT 2: mid-rail         │  SLOT 3: momentum card  ←NEW │
│  (wide, image-top) ← NEW  │  (square, image-top)         │
│                           │                              │
│                           │  PortalMessagesCard          │
│                           │  Recent activity             │
├──────────────────────────────────────────────────────────┤
│ SLOT 4: closing band (full-bleed wide, image-left) ← NEW │
└──────────────────────────────────────────────────────────┘
```

### Slot 1 — Hero ribbon (between Welcome and ProfileCompletion)
- Aspect `wide` (≈ 16:6), image-right, tone `cream`
- Purpose: humanize the greeting. Real face / Curaçao-rooted moment + 1-line affirmation.
- Mobile: stacks, image first (kept — it's brand, not a competing CTA), max-h-40

### Slot 2 — Mid-rail in left column (inside `PortalDistricts` parent, rendered after the districts grid in `PortalShell`)
- Aspect `wide`, image-top, tone `ink` (darker card for contrast against districts)
- Purpose: editorial moment between the strategic working surface and the activity flow. Story/testimonial style.
- Mobile: `priority="desktop-only"` by default (avoids pushing momentum content)

### Slot 3 — Momentum card (right column, between `TodaysFocus` and `PortalMessagesCard`)
- Aspect `square`, image-top, tone `accent` (subtle primary tint)
- Purpose: small motivational nudge — face + 1 short sentence. Lightweight, scannable.
- Mobile: kept (it's small and brand-positive)

### Slot 4 — Closing band (full-width, below the 2-column grid)
- Aspect `wide` full-bleed within the 1440 container, image-left, tone `cream`
- Purpose: end-of-page brand sign-off. People + mission line ("Built in Curaçao", etc.).
- Mobile: stacks, image first, slightly shorter

## Files

- **New** `src/components/dashboard/portal/decor/BrandImageSlot.tsx` — the primitive
- **Edit** `src/components/dashboard/portal/PortalShell.tsx` — insert the 4 slots at the positions above with placeholder copy you can rewrite later
- No other files touched; no data, no edge functions, no migrations

## Why this respects the doctrine

- **Desktop = strategic**: slots sit *between* working zones, never inside them; they don't compete with CTAs
- **Mobile = reactive**: Slot 2 hides by default on mobile, Slots 1/3/4 collapse and remain low-friction
- **IA preserved**: zone order unchanged (Welcome → Completion → Workspace → Closing)
- **Recognition over recall**: every slot pairs image with a labeled message — no decorative-only orphans
- **Aesthetic & minimalist**: one primitive, semantic tokens, no new color additions

## How you'll use it later

```tsx
<BrandImageSlot
  src="/brand/seekers/hero-01.jpg"
  alt="Aisha, certified via Lansa"
  eyebrow="From Willemstad"
  headline="Your story belongs on the shortlist."
  body="Real people. Real verified profiles. Real opportunities."
  aspect="wide"
  placement="image-right"
  tone="cream"
/>
```

Leave `src` empty and you'll see a clearly-labeled placeholder with the expected aspect ratio, so you can design the image to fit exactly.
