
## Root Cause — Conflicting max-widths

**The real issue**: There are TWO competing width constraints fighting each other:

1. **`DashboardLayout.tsx` (line 129)** — The layout wrapper is `max-w-[1440px]` with `px-4 sm:px-6 md:px-8 lg:px-12`
2. **`Dashboard.tsx` (line 148)** — The content inside it is `max-w-7xl mx-auto` (max-width: 80rem = 1280px)

At a 1891px viewport (the user's current screen), both constraints are active. The layout gives `1440px - (2×48px padding) = 1344px` of usable space. But `max-w-7xl` = `1280px` — this is narrower than the layout's available space, so `mx-auto` centers the 1280px block *within* the 1344px padded area.

The result: the content floats inside the padded area — **not flush left with the nav's logo and links** — because `mx-auto` is re-centering it rather than left-aligning it with the padding that the navbar already uses.

**The fix**: The `DashboardLayout` wrapper already handles the `max-w-[1440px]` centering and all the responsive `px-*` padding to match the navbar. The `Dashboard.tsx` inner div should **not** add its own `max-w-7xl mx-auto` — it just needs to be full-width `w-full` and inherit the layout's padding. The `max-w-7xl` constraint is redundant and misaligning.

---

## Fix — 1 file change

### `src/pages/Dashboard.tsx` — line 148

Remove `max-w-7xl mx-auto` from the content wrapper. Keep `w-full` and the top padding:

```tsx
// BEFORE (line 148)
<div className="w-full max-w-7xl mx-auto pt-4 md:pt-6">

// AFTER
<div className="w-full pt-4 md:pt-6">
```

That's it. The `DashboardLayout` wrapper already provides:
- `max-w-[1440px] mx-auto` — overall centering
- `px-4 sm:px-6 md:px-8 lg:px-12` — padding that matches the navbar exactly

The content just needs to be `w-full` to fill that space flush, matching the navbar alignment.
