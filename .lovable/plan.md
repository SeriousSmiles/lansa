
# Mentor Dashboard Branding and Onboarding Flow Polish

## Problems Found

1. **Wrong nav items for mentors**: DashboardLayout only has branches for `employer` and `else` (job seeker). Mentors see job seeker nav items (Jobs, Resources, Content Library) which are irrelevant.
2. **Mentor onboarding lacks Lansa branding**: Uses generic `bg-background` instead of the warm cream (`rgba(253,248,242,1)`) used everywhere else. Missing the Lansa logo header shown in all other onboarding flows.
3. **No branded loader on mentor dashboard**: Job seeker dashboard shows a `LansaLoader` during load; mentor dashboard shows nothing.
4. **Navigation service incomplete**: `onboardingNavigationService.ts` doesn't list `'mentor'` as a valid `UserType`, making the shared navigation helper incomplete.

## Changes

### 1. DashboardLayout -- Add mentor nav items
**File**: `src/components/dashboard/DashboardLayout.tsx`

Add a third branch for `userType === 'mentor'` with relevant menu items:
- Dashboard (`/mentor-dashboard`, IconHome)
- Content Library (`/content`, IconVideo) -- mentors can browse other content
- Profile (`/mentor-dashboard` with profile tab, or dedicated route)

This ensures mentors see their own contextually relevant navigation.

### 2. Mentor onboarding -- Apply Lansa branding
**File**: `src/components/mentor/MentorOnboarding.tsx`

- Change outer div from `bg-background` to `bg-[rgba(253,248,242,1)]` to match the warm cream theme
- Add the Lansa logo header at the top (same logo image and layout used in other onboarding flows)
- Update the header icon from `GraduationCap` to match Lansa's visual identity (keep the step indicator and progress bar)

### 3. Mentor dashboard -- Add LansaLoader
**File**: `src/pages/MentorDashboard.tsx`

- Add the `LansaLoader` component as a loading overlay while profile/subscription data loads (matching the pattern used in the job seeker dashboard)
- Add `SEOHead` with mentor-specific meta tags

### 4. Navigation service -- Add mentor type
**File**: `src/services/navigation/onboardingNavigationService.ts`

- Add `'mentor'` to the `UserType` union
- Add mentor routing: `getPostOnboardingDestination` returns `/mentor-dashboard`
- Add mentor label: `'Mentor Dashboard'`
- Add `'mentor'` to `canCompleteOnboarding` allowed types

## Technical Details

- No new files or dependencies needed
- No database changes
- All changes are UI/routing only
- Mobile layout unaffected -- DashboardLayout already handles mobile responsively through `TopNavbar` and `AnimatedTabNav`
