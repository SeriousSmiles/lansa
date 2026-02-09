

# Replace Purple Hover State with Lansa-Brand-Aligned Color

## Problem
The design system's `--accent` color is set to a purple (`280 65% 55%`), which creates a visually jarring purple background on hover states across buttons, badges, navigation menus, and toggles. This clashes with Lansa's warm orange brand identity.

## Solution
Change the `--accent` CSS variable in `src/index.css` from purple to a warm, subtle cream/orange tone that complements the Lansa brand palette. This single change cascades across the entire project for all user types (job seekers, employers, mentors) because all hover states reference `--accent`.

### Color Change

| Token | Current (Purple) | New (Warm Cream) |
|---|---|---|
| `--accent` (light) | `280 65% 55%` | `25 60% 95%` (soft warm peach) |
| `--accent-foreground` (light) | `0 0% 100%` | `14 60% 30%` (dark warm brown for contrast) |
| `--accent` (dark) | `280 65% 55%` | `14 40% 20%` (dark warm tone) |
| `--accent-foreground` (dark) | `0 0% 100%` | `14 60% 90%` (light warm text) |
| `--accent` (employer light) | `280 65% 55%` | `215 50% 94%` (soft blue tint matching employer blue brand) |
| `--accent-foreground` (employer light) | `0 0% 100%` | `215 40% 25%` (dark blue text) |
| `--accent` (employer dark) | `280 65% 55%` | `215 30% 22%` (dark blue tone) |
| `--accent-foreground` (employer dark) | `0 0% 100%` | `215 40% 90%` (light blue text) |

## What This Affects
All hover states project-wide that use `hover:bg-accent`, including:
- Ghost and outline button variants
- Outline badge variant
- Navigation menu triggers
- Toggle outline variant

## Technical Details

**File to edit:** `src/index.css`

1. In `:root` -- update `--accent` and `--accent-foreground` to warm cream tones
2. In `.dark` -- update to corresponding dark-mode warm tones
3. In `.employer-theme` -- update to soft blue tones matching employer branding
4. In `.dark .employer-theme` -- update to dark blue tones

This is a single-file, 8-line change that globally resolves the purple hover issue across all pages and user types.

