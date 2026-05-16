# Fix mobile hero sticky pinning during zoom-out

## Root cause
`src/index.css` (~line 141) applies `overflow-x-hidden` to `body`. This turns `body` into a scroll container, which per CSS spec **breaks `position: sticky`** for descendants — the sticky inner block in `Header83.tsx` therefore never pins on mobile, so the images scroll off-screen and reveal whitespace before the zoom-out finishes.

The previous fix (250vh runway + `sticky top-0`) was correct in principle, but cannot work as long as the body is a scroll container.

## Fix (two small edits, no logic changes)

### 1. `src/index.css`
Replace the body's `overflow-x-hidden` with `overflow-x-clip`.

- `overflow-x: clip` prevents horizontal scrollbars/overflow exactly like `hidden`, but does **not** create a scroll container, so `position: sticky` keeps working.
- Supported in all modern browsers (Safari 16+, Chrome 90+, Firefox 81+) — fully covers Lansa's mobile audience.

Change:
```
@apply bg-background text-foreground font-['Public_Sans',sans-serif] overflow-x-hidden;
```
to:
```
@apply bg-background text-foreground font-['Public_Sans',sans-serif] overflow-x-clip;
```

### 2. `src/components/hero/Header83.tsx`
Keep the previous mobile runway change. Minor hardening:
- Ensure the `<section>` does not itself become a scroll container by keeping `overflow-visible` (already done).
- Keep `sticky top-0 h-[100svh]` on the inner pin container (already done).

No further code changes are required in this file.

## Why this fixes the recording
With `overflow-x: clip` on body:
- The viewport becomes the scroll container again.
- The inner pin container's `sticky top-0` correctly pins for the full 250vh runway.
- The zoom-out (`scale 3.2 → 1`) plays out as the user scrolls through that runway, and only then does the next section (`TrustStrip`) come into view.

## Risk
- Global change to body overflow. The previous behavior (preventing horizontal scrollbars on rogue wide elements) is preserved by `clip`.
- If any page somewhere depended on `body` being the scroll context, that page would have already had subtle behavior issues with sticky elements; switching to `clip` only restores standard behavior.

## Out of scope
- No copy, layout, image, animation curve, or downstream section changes.
- Desktop behavior unchanged (it already mostly worked; this only makes mobile correct).

## Verification
- Mobile: scroll from the top — the hero stays pinned, images zoom out gradually as you scroll ~1.5 screens, then the next section appears without any white gap.
- Desktop: identical to today.
- Sanity-check any other page with a sticky header/element (e.g. dashboard rail) — should be unaffected or improved.
