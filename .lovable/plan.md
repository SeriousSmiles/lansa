
## The Bug

In `JobDetailPanel.tsx`, the mobile `DrawerContent` has `max-h-[85vh] overflow-hidden` (line 332). This correctly constrains the height and hides overflow.

Inside, `JobDetailContent` uses a `flex flex-col h-full` layout with an inner `flex-1 overflow-y-auto` scrollable div. This pattern works — but only when the parent has a **defined height**. 

`max-h-[85vh]` does not establish a fixed height — it sets a maximum. The `DrawerContent` itself doesn't have `h-[85vh]` or `flex flex-col`, so the inner `flex-1` has no concrete height to grow against. The child's `overflow-y-auto` never activates because the container just expands to fit all content (up to the max), never triggering a scroll.

The `DrawerContent` component from `drawer.tsx` also renders as `flex flex-col` but the `h-auto` default lets it grow freely.

## Fix — One line change in `JobDetailPanel.tsx`

Change `DrawerContent` to have a fixed height instead of just a max-height, and ensure `flex flex-col` is present so the inner `flex-1` layout works:

```tsx
// Before:
<DrawerContent className="max-h-[85vh] overflow-hidden">

// After:
<DrawerContent className="h-[85vh] overflow-hidden flex flex-col">
```

With `h-[85vh]` (fixed height), the `flex-1` inner div now has a concrete boundary to fill against, and `overflow-y-auto` on the scrollable content area activates correctly.

## File to change

| File | Change |
|---|---|
| `src/components/jobs/JobDetailPanel.tsx` | Line 332: `max-h-[85vh] overflow-hidden` → `h-[85vh] overflow-hidden flex flex-col` |
