
## Root Cause

There are **two mismatched padding layers** causing the dashboard to appear "extra wide / shifted right":

**1. Navbar vs content horizontal padding mismatch**
- `TopNavbar` inner div: `px-4 sm:px-6 md:px-8 lg:px-12` (up to 48px per side on large screens)
- `DashboardLayout` main content div: `px-4 sm:px-6 md:px-8` (max 32px per side, no `lg:px-12`)

At `lg` breakpoints the nav is inset 48px but the content is only 32px — the content edge bleeds 16px wider than the navbar on each side, creating the visual overflow to the right.

**2. Double-wrapping padding in Dashboard.tsx**
Inside `DashboardLayout`, `Dashboard.tsx` adds its own `<div className="p-4 md:p-6">` around the content. This nested padding makes the actual content narrower than intended and visually misaligned compared to the nav.

---

## Fix — 2 file changes

### `src/components/dashboard/DashboardLayout.tsx`
Add `lg:px-12` to the main content wrapper so it matches the navbar inner div exactly:

```tsx
// BEFORE
<div ref={mainContentRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-2 md:pt-3">

// AFTER
<div ref={mainContentRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-2 md:pt-3">
```

### `src/pages/Dashboard.tsx`
Remove the double-wrapping `p-4 md:p-6` div since the layout already handles horizontal padding. Keep top spacing via `pt-4`:

```tsx
// BEFORE
<DashboardLayout ...>
  <div className="p-4 md:p-6">
    <div className="w-full">
      ...
    </div>
  </div>
</DashboardLayout>

// AFTER
<DashboardLayout ...>
  <div className="pt-4 md:pt-6">
    ...
  </div>
</DashboardLayout>
```

This removes the nested horizontal padding so content aligns perfectly with the navbar items on all screen sizes.

---

## Files changing

| File | Change |
|---|---|
| `src/components/dashboard/DashboardLayout.tsx` | Add `lg:px-12` to main content wrapper |
| `src/pages/Dashboard.tsx` | Remove double-wrap `p-4 md:p-6` div, replace with `pt-4 md:pt-6` |
