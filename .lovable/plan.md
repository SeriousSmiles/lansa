

# Move Share Lansa Button to Admin Layout

## Changes

### 1. Remove from `src/pages/Index.tsx`
- Delete the `ShareLansaMenu` import and the fixed bottom-right `<div>` wrapping it (lines 4, 82-84)

### 2. Add to `src/components/admin/AdminLayout.tsx`
- Import `ShareLansaMenu`
- Add it as a fixed bottom-right button in both desktop and mobile admin layouts
- Desktop: `<div className="fixed bottom-6 right-6 z-50">` after the `</SidebarProvider>`-scoped content
- Mobile: same fixed positioning inside `AdminMobileLayout` wrapper

The button will appear on every admin page since `AdminLayout` wraps all `/admin/*` routes via `<Outlet />`.

### Files

| File | Action |
|---|---|
| `src/pages/Index.tsx` | Remove ShareLansaMenu import + rendered element |
| `src/components/admin/AdminLayout.tsx` | Add ShareLansaMenu (fixed bottom-right) in both mobile and desktop returns |

