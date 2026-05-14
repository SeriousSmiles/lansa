## Goal

Make the oversized headlines in **Value Prop**, **How It Works**, **Capabilities**, and **Companies / Get Listed Early** sections feel as tight as the Final CTA headline ("Bo ta ribe lista? / Let's go.") — which the user has confirmed is the reference.

## What's happening now

All four sections use the shared `Display` component in `src/components/landing/_shared.tsx`. After the last edit it reads:

```
font-urbanist font-black tracking-[-0.02em] leading-[0.82]
text-[44px] sm:text-[56px] md:text-[72px] lg:text-[88px]
```

Despite `leading-[0.82]`, the screenshots still show very loose vertical gaps between the two stacked lines (e.g. "Bo ta bon." → "Now show it.", "Three steps." → "One honest shortcut.", "Everything you need." → "Nothing you don't.", "Looking for" → "real talent?").

Two likely contributors:
1. The lg breakpoint pushes the size to **88px**, which makes any leading look airy at desktop widths (current viewport is 2048px wide → `lg:` is active).
2. The Final CTA headline (the "perfect" one) is locked at `md:text-[80px]` and uses its own `leading-[0.92]` — so the *ratio* of font size to leading there reads tighter than the Display's `0.82 × 88px`.

## Change

Update only the `Display` primitive in `src/components/landing/_shared.tsx`:

- Line-height: `leading-[0.82]` → `leading-[0.92]` (match Final CTA exactly).
- Max size: drop the `lg:text-[88px]` step, cap at `md:text-[80px]` (match Final CTA exactly).
- Keep tracking, weight, and small/medium sizes unchanged.

Resulting class:

```
font-urbanist font-black tracking-[-0.02em] leading-[0.92]
text-[44px] sm:text-[56px] md:text-[80px]
```

## Why this is enough

- All four affected sections (`ValuePropBand`, `HowItWorksChapters`, `CapabilitiesBand`, `CompaniesSoonBand`) consume `Display` without overriding `leading` or the lg size, so a single edit propagates everywhere.
- The Final CTA section uses its own inline `<h2>` and is **not** touched — it stays exactly as the user likes it.
- No other components, no copy, no layout, no colors change.

## Out of scope

- No changes to Final CTA, hero (`Header83`), TrustStrip, TestimonialBand quote styling, LeadMagnetTeaser, or footer.
- No copy edits.
- No new assets.
