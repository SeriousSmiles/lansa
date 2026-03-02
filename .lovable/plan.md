
# Candidate Browser — Color Identity + Content Density Improvements

## What You're Seeing (Diagnosis)

Looking at both screenshots:

**Problem 1 — The gray right panel has no identity**
The right panel uses a fixed `bg-muted/20` background — a neutral gray that has nothing to do with the candidate's profile. Each candidate has a `cover_color` and `highlight_color` already stored in the database (it's what they use on their own profile page). The right panel should breathe the same color DNA as the candidate's identity choices — without being overwhelming.

**Problem 2 — Empty space at the bottom with sparse content**
When mock candidates have no experience/education, the right panel shows small italic placeholder text then leaves a large blank gap. There is useful information that can fill this space intelligently:
- The `professional_goal` field shows once but there's also a `biggest_challenge` that isn't displayed anywhere
- A "What they're looking for" summary tile (derived from the candidate's onboarding goal data)
- A "Quick Profile Stats" tile showing: number of skills, years of experience (if derivable from dates), education level
- A "Conversation Starter" tile — an AI-generated prompt to help the employer break the ice, which adds real value and fills the space meaningfully

## Implementation Plan

### Change 1 — Tint the right panel with the candidate's accent color

In `RightPanel.tsx`, the outer wrapper currently has `bg-muted/20`. This will be replaced with a dynamic tint derived from the candidate's `highlight_color` (which defaults to `#FF6B4A` if unset). The approach:

- Pass `highlight_color` from `profile` into the container background as an inline style using very low opacity (6–8%) so the tint is subtle — enough to feel personal, not enough to be garish
- The `SectionCard` headers (currently `bg-muted/40`) will use the same color at slightly higher opacity (12%) to reinforce the hierarchy
- The `border-primary` on the Professional Goals quote bar will use `highlight_color` instead of the global primary so it matches the candidate's color

This connects the right panel's visual identity directly to the candidate's own profile color choices. Every candidate will look and feel slightly different.

```text
Before: bg-muted/20 (neutral gray for every candidate)
After:  background: rgba(highlight_color, 0.06) (unique to each candidate)
```

### Change 2 — Add the "Biggest Challenge" tile

The `DiscoveryProfile` interface currently maps `professional_goal` but the candidate's `biggest_challenge` field exists in `user_profiles_public` and is NOT mapped or displayed. This is valuable signal for an employer:

- Update `DiscoveryProfile` interface in `discoveryService.ts` to add `biggest_challenge?: string`
- Update the `.map()` in `discoveryService.ts` to pull `biggest_challenge` from the database record
- In `RightPanel.tsx`, add a "Biggest Challenge" tile below Professional Goals with a different icon (e.g. `Zap` or `AlertCircle`) and a left border in a different accent shade

This directly fills the empty bottom space with real, meaningful content.

### Change 3 — Add a "Quick Stats" summary strip

Between the Experience/Education tiles and the Languages/Achievements row, add a compact horizontal strip tile showing at a glance:
- Skills count: "6 skills listed"
- Experience: "3 roles" or "No experience yet"
- Education: "Bachelor's degree" (first education title) or "No formal education listed"
- Profile completeness indicator (simple pill: "Profile 80% complete" using primary color)

This makes candidates with sparse profiles feel less empty — the strip always renders regardless of data presence and shows the employer a compact summary they can scan in 2 seconds.

### Change 4 — Section card headers use the candidate's color

The `SectionCard` header row (currently `bg-muted/40` flat gray) will use a tint of the candidate's `highlight_color` at ~10% opacity. The icon and title text will use the same color at full opacity (replacing the flat `text-muted-foreground`). This makes each section header feel branded to the candidate rather than generic.

### Change 5 — Pass `highlight_color` into RightPanel

Currently `RightPanel` only receives `profile`. It already has access to `profile.highlight_color`. The changes are all self-contained within `RightPanel.tsx` and `discoveryService.ts` — no prop interface changes needed for parent components.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/discovery/desktop/RightPanel.tsx` | Dynamic background tint, colored section headers, biggest_challenge tile, quick stats strip |
| `src/services/discoveryService.ts` | Add `biggest_challenge` to interface + mapping |

## Visual Result

Each candidate's right panel will feel like an extension of their personal brand rather than a generic gray form. An employer browsing candidates will notice the subtle color shift as they move through candidates — making the experience feel more human and alive. The bottom space is filled with the biggest challenge tile and quick stats strip, so no candidate profile ever feels like a half-empty page.

## What Is NOT Changed
- Left panel — already looks good per your feedback
- Animation system — preserved as-is (key-prop based)
- Action buttons — unchanged
- Data fetching logic — only the mapping adds one field
- Mobile SwipeDeck — untouched
