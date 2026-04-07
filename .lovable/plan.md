

# SlideSidebar → Bottom Drawer on Mobile

## What Changes

On mobile/tablet (≤ 1024px), the slide sidebar becomes a **bottom drawer** using the existing `vaul`-based `Drawer` component (`src/components/ui/drawer.tsx`). It supports native drag-to-close. On desktop, the current left sidebar stays unchanged.

## Files to Change

### `src/components/for-business/SlideSidebar.tsx`
- Import `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` from `@/components/ui/drawer`
- Add a `useIsSmallViewport` check (≤ 1024px) — same pattern as `PresentationShell`
- **Desktop (> 1024px)**: Render current left-panel sidebar as-is
- **Mobile (≤ 1024px)**: Render a `<Drawer>` with `open={open}` and `onOpenChange` calling `onToggle`
  - `DrawerContent` contains the same slide list, styled as horizontal pill chips or a vertical list with larger 44px tap targets
  - Vaul handles drag-to-close natively via the handle bar
  - The collapsed toggle button on mobile becomes a small pill/button in the top bar area (already handled by the hamburger in `PresentationShell`)

### `src/components/for-business/PresentationShell.tsx`
- No structural changes needed — the hamburger button already toggles `sidebarOpen`, and `SlideSidebar` receives `open`/`onToggle` which will now control the drawer on mobile

## Technical Details
- Vaul's `Drawer` component already supports swipe-to-dismiss — no custom gesture code needed
- Drawer snaps to bottom, has built-in handle bar and overlay
- Slide items inside drawer use `min-h-[44px]` for touch compliance
- Active slide highlighted with brand blue, same as desktop

