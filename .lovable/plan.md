

# Fix Organization Logos in Job Feed

## Root Causes Found

### Root Cause 1: `fetch-job-feed` edge function uses ANON key (RLS blocks organizations)
**File:** `supabase/functions/fetch-job-feed/index.ts` (line 15)

The function creates its Supabase client with `SUPABASE_ANON_KEY`. Since the `organizations` table only allows SELECT for the `authenticated` role, the join to `organizations` silently returns `null` -- the logo data exists in the database but RLS blocks the anon role from reading it.

Compare with `fetch-learning-job-feed` which correctly uses `SUPABASE_SERVICE_ROLE_KEY` (line 20).

**Fix:** Change `SUPABASE_ANON_KEY` to `SUPABASE_SERVICE_ROLE_KEY` on line 15. The function already validates the user's JWT manually (lines 27-36), so service role is safe here.

---

### Root Cause 2: `fetch-learning-job-feed` never joins the `organizations` table
**File:** `supabase/functions/fetch-learning-job-feed/index.ts` (lines 88-92)

The query only joins `companies(name, logo_url, industry, location)`. It does NOT join `organizations`. From the database, the `companies` table has `logo_url = NULL` for existing records, while the actual logos are stored on the `organizations` table. So `job.companies.logo_url` is always null.

**Fix:** Add `organizations(id, name, logo_url)` to the select query. Then in the response mapping (line 204), add a top-level `logo_url` field that prefers organization logo over company logo.

---

### Root Cause 3: UI components don't check for organization logo
Multiple UI components only check `job.companies?.logo_url` and miss the organization logo entirely:

| Component | What it checks | What it should also check |
|---|---|---|
| `LearningJobPostCard.tsx` (line 62) | `job.companies?.logo_url` | `job.organizations?.logo_url` (fallback) |
| `JobDetailPanel.tsx` (line 169) | `job.companies?.logo_url` | `job.organizations?.logo_url` (fallback) |
| `JobDetailModal.tsx` (line 32) | `job.business_profiles.logo_url` (doesn't exist in response) | `job.organizations?.logo_url` or top-level `job.logo_url` |
| `JobPostCard.tsx` (line 16-28) | `job.organizations?.logo_url` then `job.business_profiles?.organizations?.logo_url` | Already correct for org logo, but should also check top-level `job.logo_url` |

**Fix:** Create a shared `getJobLogo` helper that checks: `job.organizations?.logo_url` -> `job.companies?.logo_url` -> `job.logo_url` -> `null`. Use it in all four components.

---

## Implementation Plan

### Step 1: Fix `fetch-job-feed` edge function
- Change `SUPABASE_ANON_KEY` to `SUPABASE_SERVICE_ROLE_KEY` (line 15)

### Step 2: Fix `fetch-learning-job-feed` edge function
- Add `organizations(id, name, logo_url)` to the select query (line 89-92)
- In the response mapping (line 204), add `logo_url: job.organizations?.logo_url || job.companies?.logo_url || null`

### Step 3: Fix UI components (4 files)
- Add a shared logo resolution helper to each component (or a shared util)
- Update `LearningJobPostCard.tsx` to check organizations logo first
- Update `JobDetailPanel.tsx` to check organizations logo first  
- Update `JobDetailModal.tsx` to replace the broken `business_profiles.logo_url` check
- Update `JobPostCard.tsx` to also fall back to top-level `job.logo_url`

### Step 4: Deploy edge functions and test

### Files Changed

| File | Change |
|---|---|
| `supabase/functions/fetch-job-feed/index.ts` | Use service role key |
| `supabase/functions/fetch-learning-job-feed/index.ts` | Add organizations join + map logo_url |
| `src/components/jobs/LearningJobPostCard.tsx` | Check org logo with fallback |
| `src/components/jobs/JobDetailPanel.tsx` | Check org logo with fallback |
| `src/components/jobs/JobDetailModal.tsx` | Fix broken logo check |
| `src/components/jobs/JobPostCard.tsx` | Add top-level logo_url fallback |

