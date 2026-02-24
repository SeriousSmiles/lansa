

# Fix: Restore Profile Page as Post-Onboarding Destination for Job Seekers

## Problem
After completing the AI onboarding flow, job seekers are sent to `/certification` instead of `/profile` (the profile-building page). This happened because someone hardcoded `navigate('/certification', { replace: true })` in `AIOnboardingFlow.tsx` line 226, bypassing the navigation service that correctly routes job seekers to `/profile`.

The navigation service (`onboardingNavigationService.ts`) is already imported but never called -- the function `getPostOnboardingDestination` is imported on line 214 but ignored in favor of the hardcoded certification route.

## Fix (Single File Change)

**File: `src/components/onboarding/AIOnboardingFlow.tsx`** (lines 222-226)

Replace the hardcoded certification navigation with the proper navigation service call:

```text
Before:
  toast.success('Onboarding completed! Setting up your profile...');
  navigate('/certification', { replace: true });

After:
  toast.success('Onboarding completed! Setting up your profile...');
  const destination = getPostOnboardingDestination('job_seeker');
  navigate(destination, { replace: true });
```

This uses the already-imported `getPostOnboardingDestination` function, which returns `/profile` for job seekers. If the routing logic ever needs to change (e.g., based on career path), it can be updated in one place -- the navigation service -- instead of hunting through components.

## Flow After Fix
1. User completes AI onboarding steps (welcome, demographics, skills, goals, summary)
2. Onboarding is marked complete in the database
3. User state is refreshed
4. User is navigated to `/profile` to build their full profile
5. Certification remains accessible from the dashboard/profile when the user is ready

## No Other Files Affected
- The navigation service already returns `/profile` for job seekers
- The `useOnboardingNavigation` hook already works correctly
- No database or RLS changes needed
