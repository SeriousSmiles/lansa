

# Revert Sidebar + Convert DetailSheet to Drawer on Mobile

## Two changes

### 1. Revert SlideSidebar to original (no drawer)
The sidebar was working fine before. Remove the drawer logic and `useIsSmallViewport` hook, restoring the original desktop-only left panel with toggle button. The sidebar was never meant to be a drawer.

**File**: `src/components/for-business/SlideSidebar.tsx`
- Remove `Drawer` imports and `useIsSmallViewport` hook
- Remove the `if (isSmall)` branch that renders a Drawer
- Restore original code: just the desktop left-panel sidebar with the collapsed ChevronRight toggle and the slide-out panel

### 2. Convert DetailSheet to bottom Drawer on mobile (≤ 1024px)
The right-side info sheets (triggered by "Learn more" buttons on slides) currently use a `Sheet` from the right. On mobile this is hard to use. Convert to a bottom `Drawer` with drag-to-close.

**File**: `src/components/for-business/DetailSheet.tsx`
- Add `useIsSmallViewport` hook (≤ 1024px)
- **Desktop**: Keep current `Sheet` with `side="right"` unchanged
- **Mobile**: Render a `Drawer` (vaul) instead, opening from the bottom with native drag-to-close
  - Same content: title, description, stat block, bullet list
  - Max height ~85vh so it doesn't cover the full screen
  - Drag handle bar from the Drawer component

## Files to change

| File | Change |
|---|---|
| `SlideSidebar.tsx` | Revert to original — remove Drawer, remove viewport hook |
| `DetailSheet.tsx` | Add viewport check; render Drawer on mobile, Sheet on desktop |

