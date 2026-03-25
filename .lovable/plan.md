
## What the user wants

1. **Badge**: Replace the canvas-drawn dot + "Lansa" text with the actual Lansa combination mark logo (the full logo PNG with icon + "Lansa" wordmark) rendered inline after "Powered by " — all on one line, sized so the logo is clearly readable but small.
2. **No heart shape** — the current canvas-drawn dot had a quirky double-arc that read as a heart at small sizes. The real logo replaces this entirely.
3. **Larger QR code** — increase `qrSize` from 220 to 280 (and grow canvas height accordingly to fit).

## Plan

### Step 1 — Copy the logo to src/assets
Copy `user-uploads://Lansa_Combination_Mark_Logo_Blue.png` → `src/assets/lansa-logo-blue.png`

### Step 2 — Update `QRCodeModal.tsx`

**QR size**: `qrSize` 220 → 280. Canvas height grows from 720 → ~800 to accommodate the larger QR + badge spacing.

**Badge rendering** — replace the entire current badge block (lines 235–298) with:
1. Load the logo PNG via `loadImage` using a data URL imported at the top of the function. Since `import` of a PNG isn't directly usable in a canvas `loadImage`, we fetch it via a `<img>` with `src` set to the imported asset URL (same pattern as QR image load already used).
2. Measure "Powered by " text width.
3. Scale the logo image to a target height of **22px** on canvas (the logo is wide — its aspect ratio is roughly 4:1, so at 22px tall it's ~88px wide — clearly readable at card scale).
4. Draw inline: `"Powered by "` text (gray) → logo image scaled to 22px tall, vertically centered on the same midY baseline.
5. Pill background auto-sized to fit: `prefixW + logoDrawW + padding`.

**Font sizes** stay the same (`12px` prefix, `bold 13px` brand — but brand text is now gone since the logo image replaces it).

### Files changing

| File | Change |
|---|---|
| `src/assets/lansa-logo-blue.png` | Copy from user-uploads |
| `src/components/modals/QRCodeModal.tsx` | Import logo asset; increase QR size to 280; grow canvas H to 800; replace badge drawing to use real logo image |
