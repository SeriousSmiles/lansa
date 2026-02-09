

# Fix Mentor Onboarding: Duplicate Error and Stuck on Onboarding Page

## Root Cause

Two issues were found:

1. **Database constraint blocks mentors**: The `user_answers` table has a CHECK constraint that only allows `user_type` values of `'job_seeker'` or `'employer'`. When the mentor onboarding tries to save `user_type: 'mentor'`, the database silently rejects it. Without a `user_answers` row, the system never recognizes the user as having completed onboarding.

2. **No retry protection**: The `useCreateMentorProfile` hook uses `.insert()` instead of `.upsert()`. If a user retries after a partial failure, they get a "duplicate key" error because the mentor profile already exists from the first attempt.

## What Happens Today (Broken Flow)

```text
User selects "Mentor" --> Completes Steps 1 & 2 --> handleComplete runs:
  1. INSERT mentor_profiles   --> OK (row created)
  2. INSERT mentor_subscriptions --> OK (row created)  
  3. UPSERT user_answers with user_type='mentor' --> FAILS (CHECK constraint)
  4. UPDATE user_profiles.onboarding_completed=true --> OK
  5. onComplete() fires, navigates to /mentor-dashboard

But on refresh:
  UserStateProvider reads user_answers --> no row found --> hasUserType=false
  hasCompletedOnboarding = (true) && (false) = false
  --> User is redirected back to /onboarding

On retry:
  INSERT mentor_profiles --> FAILS (duplicate key) --> toast error shown
```

## Fix (4 changes)

### 1. Database migration: Add 'mentor' to the CHECK constraint
Add a SQL migration to update the `user_answers_user_type_check` constraint to allow `'mentor'` as a valid value.

### 2. Fix the stuck user's data
Include a data repair statement in the migration to insert the missing `user_answers` row for the existing mentor user (user_id `450c2e39-fd9e-42f2-8ec8-14c2d565aff9`).

### 3. Make mentor profile + subscription creation idempotent
In `src/hooks/useMentorProfile.ts`, change `useCreateMentorProfile` from `.insert()` to `.upsert()` with `onConflict: 'user_id'`. Same change in `src/hooks/useMentorSubscription.ts` for `useCreateMentorSubscription`.

This prevents the "duplicate key" error when a user retries the onboarding after a partial failure.

### 4. Better error handling in MentorOnboarding
In `src/components/mentor/MentorOnboarding.tsx`, update `handleComplete` to properly check and surface the error from the `user_answers` upsert (currently it could fail silently). Also ensure the `user_answers` upsert includes `career_path_onboarding_completed: true` for backward compatibility.

## Files Changed

- **New migration SQL** -- ALTER CHECK constraint, repair existing user data
- `src/hooks/useMentorProfile.ts` -- `.insert()` to `.upsert({ onConflict: 'user_id' })`
- `src/hooks/useMentorSubscription.ts` -- `.insert()` to `.upsert({ onConflict: 'user_id' })`
- `src/components/mentor/MentorOnboarding.tsx` -- Add `career_path_onboarding_completed: true` to user_answers upsert, improve error surfacing

## Impact

- Zero impact on job_seeker and employer flows (they already satisfy the existing constraint)
- Mentors will be able to complete onboarding and land on their dashboard
- Retries will work gracefully without duplicate errors
- The stuck user's data will be repaired automatically by the migration

