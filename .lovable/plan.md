

# Redesign Share Cards — Gradient Background + White Elements + SVG Icon Logo

## What Changes

Replace the current light card design with the uploaded gradient background image and switch all visual elements to white. Replace the combination mark logo with the uploaded Lansa SVG icon rendered inside a white circle.

## Visual Result (all 3 variants identical style)

- **Background**: The uploaded coral-purple gradient image fills the full 600×820 canvas
- **Logo**: White circle (90px diameter) centered near top, containing the Lansa bird/flame icon SVG rendered in Lansa brand blue (`#1A1F71`)
- **Headline**: White, bold — variant-specific text
- **Subtitle**: White (slightly transparent) — variant-specific text
- **QR code**: White dots on transparent background (no white card behind it)
- **URL pill**: Semi-transparent white border pill with white text `lansa.online`

## Files

| File | Action |
|---|---|
| `user-uploads://Lansa_Portrait_background_QR_Code_Card.png` | Copy to `src/assets/share-card-bg.png` |
| `user-uploads://Lansa_Logo_Icon_SVG-2.svg` | Copy to `src/assets/lansa-icon-brand.svg` |
| `src/components/ShareLansaCard.tsx` | Rework canvas drawing |

## Changes to `ShareLansaCard.tsx`

1. **Import** the new background image and SVG icon
2. **Background**: Draw the gradient image stretched to fill the full canvas (600×820) instead of the programmatic gradient + accent bar
3. **Logo area**: Draw a white filled circle (radius ~45px) centered at top, then draw the SVG icon inside it (load as image)
4. **Headline**: Change `fillStyle` from `LANSA_BRAND` to `#FFFFFF`
5. **Subtitle**: Change from `#6B7280` to `rgba(255,255,255,0.8)`
6. **QR code**: Generate with `{ dark: '#FFFFFF', light: '#00000000' }` (white dots, transparent background) — remove the white card/shadow behind it
7. **URL pill**: Change from `rgba(26,31,113,0.06)` fill to `rgba(255,255,255,0.15)` with a white 1px stroke border. Text color from `LANSA_BRAND` to `#FFFFFF`
8. **Remove**: Top accent bar drawing (no longer needed)

