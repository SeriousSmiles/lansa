

# Fix Safari iPhone Rendering Issues on /for-business

## Root Cause Analysis

There are several known Safari mobile issues affecting the presentation slides:

1. **`fixed inset-0` and `100vh` on iOS Safari**: The shell uses `fixed inset-0` which behaves inconsistently on Safari due to the dynamic toolbar (address bar shows/hides, changing available height). The `h-full` inheritance chain relies on this behaving correctly.

2. **`flex-1` in flex-col containers without explicit height**: Several slides (HeroSlide mobile strips, ProblemSlide split layout) use `flex-1` inside containers that rely on the parent having a resolved height. On Safari, if the parent's height is ambiguous (e.g., comes from `h-full` on a `fixed` element with toolbar interference), flex children may collapse or overflow unexpectedly.

3. **`overflow-y-auto` on the canvas wrapper**: On mobile, all slides are wrapped in `<div className="w-full h-full overflow-y-auto">`. Since `h-full` depends on the parent chain resolving correctly (which Safari often fails at), scroll containers may not constrain properly — content either overflows or gets cut off.

4. **`backdrop-blur` performance on Safari**: Multiple elements use `backdrop-blur` which can cause rendering glitches and compositing issues on older Safari versions.

5. **Missing `-webkit-` prefixes and Safari-safe viewport units**: No use of `dvh` (dynamic viewport height) which is the modern fix for Safari's toolbar-aware viewport.

## Plan

### 1. Fix PresentationShell viewport handling for Safari

**File**: `src/components/for-business/PresentationShell.tsx`

- Replace `fixed inset-0` with `fixed` + explicit Safari-safe dimensions using `dvh` with `vh` fallback
- Add `-webkit-fill-available` as a fallback for the outer shell height
- Ensure the main area (`flex-1`) has `min-height: 0` to prevent flex overflow (a common Safari flexbox bug)

### 2. Fix slide containers for Safari flex behavior

**Files**: Multiple slide components

- Add `min-h-0` to flex children that use `flex-1` in column layouts (Safari needs this to prevent content from overflowing flex containers)
- In `HeroSlide.tsx` mobile section: the `flex-col w-full h-full` container with flex-1 strips — add `min-h-0` to each strip and ensure the parent has an explicit height
- In `ProblemSlide.tsx`: the `h-[35vh]` image section works, but `flex-1` content area needs `min-h-0 overflow-y-auto`

### 3. Add Safari-specific CSS fixes

**File**: `src/styles/mobile-fixes.css`

Add:
- `-webkit-fill-available` height fallback for the presentation shell
- `dvh` unit support with `vh` fallback
- `-webkit-overflow-scrolling: touch` for scroll containers (older Safari)
- Reduce `backdrop-blur` intensity on mobile to prevent compositing glitches

### 4. Fix canvas scroll container

**File**: `src/components/for-business/PresentationShell.tsx`

- The mobile canvas wrapper `<div className="w-full h-full overflow-y-auto">` needs explicit height calculation instead of relying on `h-full` inheritance
- Use `calc(100dvh - 48px)` (48px = top bar) with `calc(100vh - 48px)` fallback
- Add `-webkit-overflow-scrolling: touch` for momentum scrolling

## Summary of Changes

| File | Change |
|---|---|
| `PresentationShell.tsx` | Safari-safe viewport units, flex overflow fixes, explicit canvas height |
| `HeroSlide.tsx` | Add `min-h-0` to mobile flex strips |
| `ProblemSlide.tsx` | Add `min-h-0` to flex-1 content area |
| `CTASlide.tsx` | Minor flex containment fix |
| `PricingSlide.tsx` | Ensure `min-h-full` works with Safari scroll |
| `mobile-fixes.css` | Add Safari-specific viewport and scroll fixes |

