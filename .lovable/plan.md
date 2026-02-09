

# Redesign Job Cards + Slide-in Job Detail Panel

## What Changes

### 1. Simplified Job Card
Strip the current card down to only essential elements:
- **Header**: Organization logo + job title + company name + location + posted time
- **Image**: The job post image (if present)
- **Badges**: Job type (Full-time, etc.), category (Design, etc.), Remote
- **Salary range** (if present)
- Remove: description, skills section, engagement counters, all buttons (Save, View Details, Apply Now)

The entire card becomes tappable/clickable -- tapping it opens the detail panel.

### 2. New Job Detail Panel (Desktop: Slide from Right, Mobile: Slide from Bottom)
- **Desktop**: Uses the existing `Sheet` component (Radix Dialog-based) sliding in from the right side of the page
- **Mobile**: Uses the existing `Drawer` component (vaul-based) sliding up from the bottom, draggable to close

The panel contains all the detailed info that was removed from the card: description, skills, company info, engagement metrics, plus the action buttons (Save for Later, Apply Now).

### 3. Component Architecture

```text
LearningJobFeed.tsx
  +-- LearningJobPostCard.tsx  (simplified, clickable)
  +-- JobDetailPanel.tsx       (NEW - replaces JobDetailModal usage)
       +-- Sheet (desktop)
       +-- Drawer (mobile)
       +-- Full job details + Apply Now + Save buttons
```

## Technical Details

### File: `src/components/jobs/LearningJobPostCard.tsx`
- Remove: description text, skills badges, engagement counters, Save/View Details/Apply Now buttons, save/apply state management
- Keep: header with logo, image, type/category badges, salary range, view tracking (IntersectionObserver), image modal
- Make card clickable: `onClick={() => onViewDetails(job)}` on the Card root
- Add `cursor-pointer` styling
- Remove `onApply` and `disableApply` props (moved to panel)

### File: `src/components/jobs/JobDetailPanel.tsx` (NEW)
- Accept `job`, `isOpen`, `onClose`, `onApply`, `disableApply` props
- Use `useIsMobile()` hook to conditionally render:
  - Desktop: `<Sheet>` with `side="right"` and appropriate width (~480px)
  - Mobile: `<Drawer>` from vaul, snapping from bottom, draggable to dismiss
- Content includes: full header, image, badges, description, skills, salary, company info, engagement stats
- Sticky footer with "Apply Now" button (primary) and "Save for Later"

### File: `src/pages/LearningJobFeed.tsx`
- Replace `JobDetailModal` import with new `JobDetailPanel`
- Pass `onApply`, `disableApply`, and `onClose` to the panel
- Move apply logic handling to the panel level

### Files unchanged
- `src/services/learningJobFeedService.ts` -- no data changes needed
- `src/components/jobs/JobImageModal.tsx` -- still used within the panel
