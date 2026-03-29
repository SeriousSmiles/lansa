

# Share Lansa QR Card — Build Plan

## What We're Building

A "Share Lansa" button on the homepage that, when clicked, generates and downloads a branded QR code card (PNG image) pointing to `https://lansa.online`. The card layout follows the reference image style:

1. Lansa logo (top, centered)
2. CTA phrase (e.g. "Your Career Starts Here")
3. "Scan to explore Lansa" subtitle
4. QR code (centered, large, in Lansa brand color)
5. URL text: `https://lansa.online`

## Architecture

Reuse the same Canvas API + `qrcode` library pattern from the existing `QRCodeModal.tsx`. No modal needed — just generate the card and trigger a download on click.

## Files to Change

### 1. `src/components/ShareLansaCard.tsx` (new)
- Self-contained component: a single `Button` labeled "Share Lansa"
- On click: generates a canvas (600×820px, matching QRCodeModal dimensions), draws:
  - Rounded card background (white/soft gradient)
  - Top accent bar (Lansa brand gradient)
  - Lansa combination mark logo (`lansa-logo-blue.png`) centered at top
  - CTA headline: **"Your Career Starts Here"** — bold, Lansa Blue
  - Subtitle: "Scan to explore Lansa" — grey
  - QR code (280px, `#1A1F71` dark color) encoding `https://lansa.online`
  - Bottom URL text: `https://lansa.online` in a pill/badge
- Triggers download as `lansa-qr-card.png`
- Also attempts `navigator.share` with the file on mobile (same pattern as QRCodeModal)
- Shows a toast on success

### 2. `src/pages/Index.tsx` (edit)
- Import `ShareLansaCard`
- Add it as a floating button or a third button in the hero section's button row (after "Get Started" and "Sign In")
- Positioned subtly — e.g. a smaller outlined button with a `Share2` icon

## Technical Notes
- Uses `import lansaLogoUrl from '@/assets/lansa-logo-blue.png'` (already exists)
- Uses `QRCode.toDataURL` from the `qrcode` package (already installed)
- Canvas drawing helpers (drawRoundedRect, loadImage) extracted inline — same pattern as QRCodeModal
- No auth required, no Supabase calls — purely client-side
- Mobile: Web Share API with file; Desktop: direct download + toast

