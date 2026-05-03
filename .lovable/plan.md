# Why some org job cards show no logo

## Investigation summary

I traced every place a job card renders a logo and cross-checked it against the data in `job_listings_v2`, `organizations`, and `companies`.

### Finding 1 — Most "missing" logos are missing in the database (not a bug)

Of 6 active job listings:

| Organization | org logo present? |
|---|---|
| FBTT Travel (3 jobs) | No |
| Konekta (1 job) | No |
| Lansa (2 jobs) | Yes |

Only 2 of 6 active jobs have an `organizations.logo_url` set. None of the linked `companies` rows have `logo_url` either. So for FBTT Travel and Konekta the cards correctly fall back to the `Building2` icon — there is nothing to display.

This is a **data problem**, not a rendering bug, for those orgs. They need to upload a logo via Organization Settings, OR the upload flow is failing to persist to `organizations.logo_url`.

### Finding 2 — Real code bug: duplicate / inconsistent logo resolvers

There are **three different logo-resolution implementations** living side by side, and one of them is broken:

| File | Resolver | Behavior |
|---|---|---|
| `src/utils/getJobLogo.ts` | shared helper — checks `organizations` → `companies` → `logo_url` → `business_profiles.organizations` | correct |
| `src/components/jobs/JobPostCard.tsx` | uses `getJobLogo` (via local alias) | correct |
| `src/components/jobs/JobDetailPanel.tsx`, `JobDetailModal.tsx`, `LearningJobPostCard.tsx` | use `getJobLogo` | correct |
| `src/components/jobs/JobCard.tsx` | **its own local `getCompanyLogo`** that only checks `organizations.logo_url` and `business_profiles.organizations.logo_url` — does NOT check `companies.logo_url` or top-level `logo_url` | **broken fallback** |

Result: any job rendered through `JobCard.tsx` will appear logo-less if the org row has no logo but the linked company does, or if only the flattened `logo_url` field is populated by the edge function (which it is — see `fetch-job-feed` line 211).

### Finding 3 — Real code bug: `MyApplications` reshapes data incorrectly

`src/services/jobFeedService.ts` `getMyApplications()` flattens the logo to `job.company_logo`, but `MyApplications.tsx` then re-wraps it as:
```
organizations: { logo_url: app.job.company_logo }
```
…and also reads `app.job.company_logo` directly into an `<AvatarImage>`. Two parallel shapes for the same value is fragile and inconsistent with how every other card reads logos (via `getJobLogo`).

### Finding 4 — Edge function is fine

`supabase/functions/fetch-job-feed/index.ts` and `fetch-learning-job-feed/index.ts` both:
- Use the service role key (correctly bypassing RLS on `organizations`).
- Join `companies` and `organizations` and expose both nested objects.
- Also flatten to a top-level `logo_url`.

So the data leaving the backend is correct whenever a logo exists in the DB.

## Proposed fix plan

### 1. Eliminate the duplicate resolver in `JobCard.tsx`
Replace the local `getCompanyLogo` with `getJobLogo` from `@/utils/getJobLogo`, matching every other job card. This restores the company-logo and flattened `logo_url` fallbacks.

### 2. Normalize `MyApplications` data shape
In `jobFeedService.getMyApplications()`, return jobs in the same shape as the feed (with `organizations` and `companies` nested objects) instead of inventing `company_logo`. Then `MyApplications.tsx` can use `getJobLogo(app.job)` like every other surface. Removes the parallel shape.

### 3. (Optional but recommended) Verify the org-logo upload path actually writes to `organizations.logo_url`
Since 4 of 6 orgs have null logos, check `CompanyLogoUploadModal.tsx` and `GeneralSettings.tsx` to confirm the upload writes to `organizations.logo_url` (not just `business_onboarding_data.company_logo`, which the `sync_company_logo` trigger only mirrors into `companies`, not `organizations`). If the upload UI is writing to the wrong place, that would explain why employers think they uploaded a logo but it doesn't appear.

I'll inspect both upload components before changing anything there, and only fix if a real bug is found.

## Files to change

| File | Change |
|---|---|
| `src/components/jobs/JobCard.tsx` | Replace local `getCompanyLogo` with shared `getJobLogo` |
| `src/services/jobFeedService.ts` | Return nested `organizations`/`companies` from `getMyApplications` |
| `src/components/jobs/MyApplications.tsx` | Read logo via `getJobLogo` instead of `company_logo` |
| `src/components/employer/CompanyLogoUploadModal.tsx` (only if Finding 4 surfaces a real bug) | Ensure upload persists to `organizations.logo_url` |

No DB migrations or edge function changes are needed.