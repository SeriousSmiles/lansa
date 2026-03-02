
# Fix: Candidate Browse Page - Blank After First Candidate + Visual Redesign

## Root Cause Analysis

### Bug: "Page goes blank after first candidate"

The GSAP animation architecture has a critical flaw:

1. `SplitPanelBrowser` holds `leftPanelRef` and `rightPanelRef` pointing to **wrapper divs**
2. On swipe, it calls `exitLeftPanel(wrapper)` and `exitRightPanel(wrapper)` -- setting these wrappers to **opacity: 0** and offset positions
3. After the exit, `advanceToNext()` updates the profile, triggering re-renders inside `LeftPanel` and `RightPanel`
4. But the enter animations inside those child components run on their **own internal `containerRef`**, NOT on the parent wrapper divs
5. Result: the parent wrappers stay at `opacity: 0` forever -- the page goes blank

**Fix**: After advancing to the next profile, reset the parent wrapper divs (clear GSAP props) so the child enter animations are visible. Alternatively, consolidate the animation responsibility so only one layer controls visibility.

### Infrastructure Pattern Problem

You asked about "past infrastructure causing everything to look the same." Here is the pattern I see:

- **Mock data dominance**: The `discoveryService` falls back to 20 mock candidates whenever no certified users exist. The network logs confirm `user_certifications` returns `[]` (empty), so the system always shows mock data. Every employer sees the same 20 fake candidates with stock photos.
- **Right panel appears blank for mock candidates**: Mock candidates have minimal data (1 experience, 1 education entry, short about text). The right panel renders conditionally -- if a field is empty, nothing shows. For many mock candidates, the right panel is nearly empty (as visible in your screenshot).
- **AI match summaries are generic**: The edge function generates summaries without real employer context (no business profile data exists -- `business_profiles` returns `[]`), producing vague, templated text.

This creates the "stuck in the same solution style" feeling -- the feature works mechanically but produces hollow results because the underlying data pipeline returns empty/fake data.

## Implementation Plan

### 1. Fix the GSAP Animation Bug (Critical)

In `SplitPanelBrowser.tsx`, after calling `advanceToNext()`, reset the GSAP properties on the parent wrapper refs so the child components' enter animations become visible:

```
// After advanceToNext():
gsap.set(leftPanelRef.current, { clearProps: "all" });
gsap.set(rightPanelRef.current, { clearProps: "all" });
```

This is a 3-line fix that solves the blank page issue.

### 2. Redesign the Desktop Split Panel Layout

The current layout feels unfinished because:
- Left panel is a plain white box with too much vertical padding
- Right panel uses `bg-muted/30` (barely visible gray) making it look empty
- Cards inside the right panel have no visual weight
- No clear visual hierarchy separating the two panels

**Redesign approach:**
- Left panel: add a subtle gradient header area behind the avatar, tighter spacing, stronger card styling
- Right panel: replace the washed-out background with proper card sections that have borders and subtle shadows, use the brand highlight color for section accents
- Add a visual separator/divider between panels
- Make the "Professional Goals" section more prominent with a colored accent bar (matching the screenshot's orange bar)
- Add skeleton loading states for when data is missing instead of showing nothing

### 3. Handle Empty/Sparse Profile Data Gracefully

Instead of rendering nothing when a mock candidate has no experiences, education, or achievements, show placeholder content:
- "No experience listed yet" with an icon
- "No education details available" 
- This prevents the right panel from appearing completely blank

### 4. Fix the Action Button Bar Positioning

Currently the action bar is inside the flex column flow and can get pushed off-screen. Make it sticky/fixed at the bottom of the browse area so it's always visible and accessible.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/discovery/desktop/SplitPanelBrowser.tsx` | Fix GSAP reset after advance, improve layout structure |
| `src/components/discovery/desktop/LeftPanel.tsx` | Visual redesign with gradient header, tighter spacing |
| `src/components/discovery/desktop/RightPanel.tsx` | Visual redesign with proper cards, empty state handling |
| `src/components/discovery/desktop/ActionButtonBar.tsx` | Sticky positioning fix |
| `src/utils/candidatePanelAnimations.ts` | Ensure enter animations also clear previous state |

## Technical Notes

- The animation bug is the highest priority -- it makes the feature completely unusable after the first candidate
- The visual redesign follows the existing component structure, no new components needed
- Mock data behavior is preserved (since no real certified candidates exist yet), but the UI will handle sparse data gracefully
- All changes are isolated to the desktop candidate browser -- mobile SwipeDeck is unaffected
