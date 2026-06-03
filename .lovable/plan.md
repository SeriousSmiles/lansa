## Findings

- The user’s interested swipes are in the database. I found 6 right-swiped job cards for the current user:
  - Marketing Specialist
  - Graphic Designer
  - Coordinator
  - Sailor
  - Tourist Guide
  - Cruise Dispatcher
- The Saved tab is still empty because the frontend query is failing on `job_listings_v2.created_at`, but the live table uses `posted_at` instead.
- I also found the Data API grant check returning no explicit grants for the involved tables. The app is currently reaching enough to show the column error, but I will verify and avoid changing RLS unless a permission error is still blocking after the schema fix.

## Plan

1. Update `savedJobsService.getSavedJobs`
   - Replace `created_at` with `posted_at` in the `job_listings_v2` select.
   - Map `created_at` / `updated_at` in the returned `JobListing` object from `posted_at` so the card component receives the timestamp shape it expects.
   - Include `created_by` in the select and use it as a fallback `business_id` / employer reference when available.

2. Make the Saved tab more resilient
   - Preserve the right-swipe ordering from the `swipes.created_at` timestamp.
   - Keep showing saved cards even if company/organization lookup partially fails.
   - Keep logs for actual failures so the next blocker is visible instead of silently rendering “Nothing saved yet.”

3. Validate the fix
   - Re-check the saved query against the known current user and confirm those 6 cards can be resolved.
   - If the next runtime error is a Data API permission/grant issue, add the smallest safe migration for the affected table grants without widening public access.

## Expected result

The Saved tab should show every job the user swiped Interested on, including the 6 cards already stored in the database.