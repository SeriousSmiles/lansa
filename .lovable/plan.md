

# Hero Slide — Fullscreen Industry Column Strips

## What Changes

Replace the current centered hero layout with a fullscreen column-strip selector. Six vertical strips span the full 1920x1080 canvas, each representing an industry with a B&W background image. On hover (desktop), the active strip expands while others compress, the image transitions to full color, and additional copy is revealed. Clicking/tapping selects the industry and the user continues the presentation.

## Visual Design

```text
Desktop (1920x1080 canvas):
┌──────┬──────┬──────┬──────┬──────┬──────┐
│      │      │      │      │      │      │
│ B&W  │ B&W  │ B&W  │ B&W  │ B&W  │ B&W  │
│      │      │      │      │      │      │
│Retail│Hosp. │ Tech │Health│Finan.│Other │
│      │      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┴──────┘

On hover/expand:
┌──┬────────────────┬──┬──┬──┬──┐
│  │   COLOR IMAGE   │  │  │  │  │
│  │   + Title       │  │  │  │  │
│  │   + Description │  │  │  │  │
│  │   + CTA button  │  │  │  │  │
└──┴────────────────┴──┴──────┴──┘

Mobile (1920x1080 canvas, but conceptually stacked):
Strips become horizontal rows stacked vertically.
```

## Strip Behavior

- **Default state**: Equal-width columns, B&W (`grayscale(1)`) background image with dark overlay, industry title displayed vertically or centered
- **Hovered/active state** (CSS transition ~500ms): Strip expands to ~40-50% width via `flex-grow`, others shrink. Image transitions to color (`grayscale(0)`), overlay lightens. Reveals: subtitle text, short industry-specific tagline, and a "Select" button
- **Selected state**: Orange bottom border or highlight to indicate current selection. Clicking calls `setIndustry(id)` and auto-advances to next slide after a short delay
- **Lansa branding overlay**: Small logo + "LANSA FOR BUSINESS" text positioned at top-center, floating above the strips

## Stock Images

Use high-quality Unsplash URLs for each industry:
- Retail: store/shopping scene
- Hospitality: hotel/restaurant scene
- Tech: office/workspace scene
- Healthcare: medical/hospital scene
- Finance: business/financial district scene
- Other: diverse workplace scene

## Mobile Adaptation

Inside the 1920x1080 canvas, detect if the rendered context is mobile-like (or use a state toggle). For mobile:
- Switch from `flex-row` to `flex-col` — strips become horizontal rows
- Each row spans full width, height divided equally
- Tap toggles expand/collapse (only one expanded at a time)

Since this renders inside the `SlideRenderer` at 1920x1080 and scales down, the mobile layout will be handled within the same component using the canvas dimensions.

## User Journey

Selection flow unchanged:
1. User sees the strips
2. Hovers to explore, clicks to select
3. `setIndustry(id)` is called
4. PresentationShell advances to slide 1 (auto or via next button)

## Technical Details

- All transitions via CSS (`transition-all duration-500 ease-in-out`)
- `filter: grayscale(1)` to `grayscale(0)` for color reveal
- `flex-grow` manipulation for expand/compress
- Background images via inline `style={{ backgroundImage }}` with `bg-cover bg-center`
- Keep `AnimatedLogo` at top for brand presence
- Each strip has a dark gradient overlay (`bg-gradient-to-t from-black/70 via-black/30 to-black/20`)

## File

| File | Action |
|---|---|
| `src/components/for-business/slides/HeroSlide.tsx` | Rewrite — fullscreen column strips with B&W-to-color expand interaction |

