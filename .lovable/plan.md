

# Bento Grid Redesign for User Type Selection (Desktop)

## Current State
The 4 cards ("Seeking Opportunities", "Building Teams", "Join Existing Team", "Mentor") are laid out in a uniform `grid-cols-4` on desktop -- all equal size. This doesn't communicate visual hierarchy or guide users toward the most common paths.

## Proposed Bento Layout (Desktop Only)

The desktop grid will use a 2-row, asymmetric bento layout to give visual prominence to the most popular user types:

```text
+-------------------------------+-------------------+
|                               |                   |
|   Seeking Opportunities       |  Building Teams   |
|   (spans 2 cols, tall)        |  (1 col)          |
|                               |                   |
+---------------+---------------+-------------------+
|               |                                   |
| Join Existing |          Mentor                    |
|    Team       |     (spans 2 cols)                 |
|   (1 col)     |                                   |
+---------------+-----------------------------------+
```

- **Row 1**: "Seeking Opportunities" takes 2 columns (largest, most common user type). "Building Teams" takes 1 column.
- **Row 2**: "Join Existing Team" takes 1 column. "Mentor" takes 2 columns (second most prominent).
- This creates a visually dynamic bento grid where the eye naturally flows to the larger cards first.

## Mobile Behavior
No changes to mobile -- cards remain stacked vertically in a single column with the existing expand/collapse interaction.

## Technical Details

**File modified:** `src/components/onboarding/UserTypeSelection.tsx`

Changes to the grid container and individual card classes:

1. **Grid container**: Change from `grid-cols-1 lg:grid-cols-4` to `grid-cols-1 lg:grid-cols-3` (3-column base grid)
2. **Seeking Opportunities card**: Add `lg:col-span-2` to span 2 columns
3. **Building Teams card**: Keep at 1 column (default)
4. **Join Existing Team card**: Keep at 1 column (default)
5. **Mentor card**: Add `lg:col-span-2` to span 2 columns
6. Adjust the colored header section heights for the larger cards to feel proportional (e.g., taller hero area on span-2 cards)

No new files, dependencies, or database changes required.

