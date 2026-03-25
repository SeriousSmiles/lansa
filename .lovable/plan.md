
## Root Cause — Confirmed

The `PopoverPrimitive.Portal` teleports the icon grid to `document.body`. Radix `Dialog` applies a **focus trap and pointer-event lock** to everything outside its own `DialogPortal` DOM subtree. Since the icon grid lives at `document.body` level (outside the Dialog's portal), Radix Dialog blocks all pointer events on it — clicks do nothing and the cursor shows as default.

The fix: **remove `PopoverPrimitive.Portal`** from `IconPicker.tsx` so the popover content renders inline inside the Dialog's DOM tree. This puts it where Radix Dialog allows pointer events. The icon grid will still visually float above other content via `position: absolute` (which Radix Popover applies automatically), and z-index keeps it on top.

## The Fix — 1 file, 1 line change

**`src/components/admin/updates/IconPicker.tsx`**

Remove the `<PopoverPrimitive.Portal>` wrapper around `<PopoverPrimitive.Content>`. The content renders directly, staying inside the Dialog DOM tree. All existing z-index, border, shadow, animation classes stay the same.

```tsx
// BEFORE — portal escapes Dialog tree, pointer events blocked
<PopoverPrimitive.Portal>
  <PopoverPrimitive.Content className="z-[9999] ...">
    ...
  </PopoverPrimitive.Content>
</PopoverPrimitive.Portal>

// AFTER — no portal, stays inside Dialog tree, clicks work
<PopoverPrimitive.Content className="z-[9999] ...">
  ...
</PopoverPrimitive.Content>
```

Also add `cursor-pointer` to the icon `<button>` className so the cursor changes correctly on hover — fixing the second symptom the user reported.

## Files changing

| File | Change |
|---|---|
| `src/components/admin/updates/IconPicker.tsx` | Remove `PopoverPrimitive.Portal` wrapper; add `cursor-pointer` to icon buttons |
