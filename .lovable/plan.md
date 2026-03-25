
## Bug: IconPicker doesn't visually update after selection

### Root Cause

`IconPicker.tsx` uses an **uncontrolled** `<Popover>` — there is no `open` state wired to it. When the user clicks an icon inside the popover grid, `onChange(key)` fires and updates the React Hook Form field value, but the Popover stays open. Since the trigger button (which shows the selected icon) is hidden behind the open popover, the user never sees the icon change.

The popover must be closed programmatically after a selection so the trigger button re-renders with the new icon visible.

### Fix — Single file, 8 lines

**`src/components/admin/updates/IconPicker.tsx`**

1. Import `useState` from React
2. Add `const [open, setOpen] = useState(false)` inside the component
3. Pass `open` and `onOpenChange={setOpen}` to `<Popover>`
4. In the icon button's `onClick`, call `onChange(key)` then `setOpen(false)` so the popover closes and the trigger button immediately reflects the new selection

No other files need to change. The form integration (`field.value` / `field.onChange`) in `UpdateFormDialog.tsx` is correct — the data is updating, it's just not visible to the user.
