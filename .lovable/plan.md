## Problem

On `/jobs` (LearningJobFeed), the "I'm Interested" button on `JobPostCard` either appears to do nothing or shows the toast "Edge Function returned a non-2xx status code".

Root causes confirmed against the DB and code:

1. **`JobPostCard` never shows "Applied" for v2 feed.** It only checks `job.job_applications?.length > 0`, but the learning feed populates `user_application_status` instead. The current user already applied to e.g. Coordinator and Graphic Designer (`job_applications_v2` rows for `e15bf03c…`), yet the card keeps rendering "I'm Interested". Clicking it re-submits and the server returns `409 ALREADY_APPLIED`.

2. **`learningJobFeedService.applyForJob` mis-parses the Supabase Functions error.** It tries `JSON.parse(ctx.body)` first, but `FunctionsHttpError.context` on supabase-js v2 exposes a `Response` (not a pre-read string), so `JSON.parse(undefined)` throws, the fallback `JSON.parse(error.message)` also throws, `payload` becomes `{}`, the `ALREADY_APPLIED` branch is never hit, and the raw "Edge Function returned a non-2xx status code" is surfaced as a toast.

## Fix

### 1. `src/components/jobs/JobPostCard.tsx`
- Treat the card as already-applied when EITHER `job.job_applications?.length` OR `job.user_application_status` is a non-null, non-`withdrawn` value.
- Keep the existing "Applied" disabled-button rendering.

### 2. `src/services/learningJobFeedService.ts` — `applyForJob`
- Replace the brittle `ctx.body` JSON.parse chain with an async helper that:
  - If `ctx` is a `Response` (or has `.json` / `.text`), `await ctx.json()` (fallback to `text()` then `JSON.parse`).
  - Else if `ctx.body` is a string, `JSON.parse(ctx.body)`.
  - Else `{}`.
- Use the parsed payload's `code === 'ALREADY_APPLIED'` (or message regex) to return the soft-success object as before.
- Preserve the "Job is no longer active" branch and the final `throw new Error(msg)` for genuinely unknown failures.

### 3. (Defensive) `src/pages/LearningJobFeed.tsx`
- No behavior change required; `handleApply` already optimistically sets `user_application_status = 'pending'`, which — combined with fix #1 — will flip the button to "Applied" immediately after a successful apply.

## Out of scope

- No changes to the swipe deck, `apply-for-job-v2` edge function, RLS, or DB schema. The function itself responds correctly; only the client interpretation is wrong.
- Desktop `JobCard` is currently unused and not touched.

## Validation

- Reload `/jobs`: cards for jobs already in `job_applications_v2` for the signed-in user render the disabled "Applied" button instead of "I'm Interested".
- Click "I'm Interested" on a fresh card → success toast + card flips to "Applied".
- Click "I'm Interested" on a card the user already applied to (forced via stale state) → info toast "You've already applied…" instead of the generic non-2xx error.
