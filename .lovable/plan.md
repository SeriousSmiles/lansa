

# Full Rebuild: Mobile Swipeable Candidate Browser

## Overview
A complete rebuild of the mobile employer candidate browsing experience. The current implementation works but feels basic -- this rebuild will create a polished, Tinder-caliber swipe experience with better card design, smoother animations, overlay feedback, match celebrations, an undo feature, and a bottom-sheet detail view.

## What Changes

### 1. New Swipe Card Component
Replace `SwipeCard` with a reimagined card optimized for the mobile swipe context:
- Full-viewport stacked card layout (top card active, 2 cards visible behind with depth/scale)
- Gradient cover header with avatar, name, title, location, and certification badge
- Scrollable body showing top 5 skills as colored chips, short bio snippet, and latest experience
- Real-time directional overlay: dragging right shows a green "INTERESTED" label with heart icon; dragging left shows a red "PASS" label with X icon; the overlay opacity scales with drag distance
- Card rotation follows drag direction (max 12 degrees) with subtle scale reduction

### 2. Rebuilt Swipe Engine
Replace the current GSAP Draggable-based `SwipeableContainer` with a custom pointer-event-driven swipe engine (similar to the existing `SwipeCard` approach but improved):
- Velocity-aware flick detection: fast flicks trigger swipe even at short distances
- Spring-back animation using GSAP `back.out` easing when threshold not met
- Exit animation: card flies off-screen with rotation and opacity fade (300ms)
- Entry animation: next card scales up from the stack with a subtle bounce (250ms)
- Haptic feedback on swipe completion (using existing `mobileUtils.hapticFeedback`)

### 3. Bottom-Sheet Candidate Detail
Add a "tap to expand" interaction on the card that opens a Vaul Drawer (already installed) showing the full candidate profile:
- Full bio, complete experience timeline, education, languages, all achievements
- AI Match Summary section (using the existing `matchSummaryService` edge function)
- Action buttons (Pass / Interested / Super Interest) inside the sheet so users can act from the detail view
- Drag handle at top, 90% screen height, smooth slide-up animation

### 4. Match Celebration Overlay
When a mutual match is detected (from `swipeService.checkForMatch`):
- Full-screen overlay with confetti-style animation
- Shows both user avatars side by side
- "It's a Match!" headline with the candidate's name
- Two action buttons: "Send Message" (navigates to chat) and "Keep Browsing" (dismisses)
- Auto-dismisses after 5 seconds if no interaction

### 5. Undo Last Swipe
- Floating "Undo" button appears for 4 seconds after each swipe (left passes only)
- Reverses the card exit animation, bringing the previous candidate back
- Calls `swipeService` to remove the last swipe record (requires a new delete method)
- Only stores last 1 swipe for undo (not a full history)

### 6. Improved Filter Experience
Convert the current Dialog-based filter into a proper bottom-sheet (Vaul Drawer):
- Certification filter toggle (on by default for certified-only browsing)
- Skill chips with autocomplete from common skills
- Location and availability filters
- Active filter count shown as badge on the filter icon in the header

### 7. Progress and Stats Header
Redesign the sticky header:
- Compact single-row layout: back arrow, "Browse Candidates" title, filter icon with active count badge
- Below: minimal stat row showing "X matches" and "Y reviewed today" as small pills
- Counter showing current position (e.g., "3 of 18")

## Data Flow (No RLS Changes Needed)

All existing RLS policies support this feature:
- **Read candidates**: `user_profiles_public` (public view, no RLS restrictions for authenticated users)
- **Certification check**: `user_certifications` cross-referenced at application level (existing pattern)
- **Record swipes**: `swipes` table -- insert policy requires `swiper_user_id = auth.uid()`
- **Check matches**: `matches` table -- select policy allows participants (`user_a` or `user_b = auth.uid()`)
- **Swipe history**: `swipes` table -- select filtered by `swiper_user_id = auth.uid()`
- **AI match summary**: existing `generate-match-summary` edge function with JWT auth

## Technical Details

### Files Modified
- `src/components/mobile/employer/MobileCandidateBrowser.tsx` -- Full rebuild with new layout, bottom-sheet detail, undo, match celebration
- `src/components/mobile/employer/EnhancedCandidateCard.tsx` -- Redesigned for swipe context (more compact, overlay indicators)
- `src/components/mobile/SwipeableContainer.tsx` -- Rebuilt swipe engine with velocity detection and better animations
- `src/components/mobile/employer/MobileFilterModal.tsx` -- Convert to Vaul Drawer bottom-sheet

### New Files
- `src/components/mobile/employer/MatchCelebration.tsx` -- Full-screen match overlay component
- `src/components/mobile/employer/CandidateDetailSheet.tsx` -- Bottom-sheet with full profile + AI summary
- `src/components/mobile/employer/SwipeOverlayIndicator.tsx` -- The LIKE/PASS directional overlay

### Services Modified
- `src/services/swipeService.ts` -- Add `deleteLastSwipe()` method for undo functionality (delete from `swipes` where `swiper_user_id = auth.uid()`, ordered by `created_at desc`, limit 1)

### Dependencies Used (Already Installed)
- `gsap` -- Card animations, transitions, spring physics
- `vaul` -- Bottom sheet for candidate detail and filters
- `framer-motion` -- Match celebration overlay entrance animation
- `lucide-react` -- Icons for action buttons and indicators

