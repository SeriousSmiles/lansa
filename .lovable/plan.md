
## Root Cause Summary

Three RLS gaps block data from showing:

### Gap 1 — `user_profiles`: Candidates can't read employer profiles from swipes
No policy allows a candidate to read the `user_profiles` row of someone who swiped on them. Result: `employer_name`, `employer_title`, `employer_image`, `employer_cover_color` are all null → "An Employer" shown everywhere.

**Fix**: Add a policy that allows reading a profile if the viewer was swiped on by that user:
```sql
CREATE POLICY "Candidates can view profiles of employers who swiped them"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.swipes
    WHERE swipes.swiper_user_id = user_profiles.user_id
      AND swipes.target_user_id = auth.uid()
      AND swipes.direction IN ('right', 'nudge')
  )
);
```

### Gap 2 — `job_listings_v2`: Org-linked jobs invisible to candidates
Jobs tied to an `organization_id` are blocked by `authenticated_select_org_jobs` (requires org membership). The `read_active_jobs` policy allows public jobs but org-linked jobs are filtered out first.

**Fix**: Add a policy so candidates can read active job listings regardless of org:
```sql
CREATE POLICY "Candidates can view active job listings from any employer"
ON public.job_listings_v2 FOR SELECT
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
);
```
*(This is the same as `read_active_jobs` but without the org membership restriction. The existing `read_active_jobs` policy already does this, but because `authenticated_select_org_jobs` uses permissive AND-logic conflicts, we need to ensure the simpler policy wins for non-members. Since Supabase uses OR logic between permissive policies, `read_active_jobs` should actually already pass — the issue is that `authenticated_select_org_jobs` implicitly blocks org-linked jobs for non-members. We'll verify in the migration by checking if `read_active_jobs` already covers this.)*

Actually — Supabase's permissive policy model uses OR: if ANY permissive policy allows a row, it passes. So `read_active_jobs` should already allow active jobs. The actual issue is the query in `EmployerInterestDrawer` filters `.eq("created_by", employer_id)` — the `recruiters_select_own` policy only allows the creator to see their own jobs, and `read_active_jobs` + `authenticated_select_org_jobs` together should allow active ones. Let me re-check: `authenticated_select_org_jobs` says `(organization_id IS NULL) OR (is org member)` — this means org-linked jobs are **only** visible if you're a member OR org_id is null. But `read_active_jobs` is a separate permissive policy that returns `is_active = true`. Since they're both permissive, the row passes if EITHER is satisfied. So org-linked active jobs DO pass `read_active_jobs`. The job fetching should actually work.

**Real Gap 2 — `organizations` table: Company name/logo blocked**
The drawer currently only shows `employer_name` from `user_profiles`, not the company/org name or logo. Employers are businesses — their relevant name is their **organization name** and **logo_url** from the `organizations` table. The only SELECT policies on `organizations` allow: org members, admins, and `is_active = true` for searching.

The `is_active = true` policy IS a permissive policy — so active orgs are readable by anyone authenticated. This should actually work.

**The real fix needed**: Update `WhoIsInterestedSection` to also join `organization_memberships` → `organizations` to get the org name + logo for each employer, and display that in both the card and drawer.

### Gap 3 — Frontend: Not fetching org name/logo at all
The `WhoIsInterestedSection` only fetches `user_profiles` fields. It never fetches organization data. For employers, the relevant "business name" is in `organizations.name` and `organizations.logo_url`, fetched via `organization_memberships`.

**Fix**: After getting employer IDs, query `organization_memberships` + `organizations` to get their company info.

---

## Plan

### 1. DB Migration: Fix `user_profiles` RLS
Add one policy so candidates can read the profile of employers who swiped on them.

```sql
CREATE POLICY "swipe_targets_can_read_swiper_profiles"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.swipes
    WHERE swipes.swiper_user_id = user_profiles.user_id
      AND swipes.target_user_id = auth.uid()
      AND swipes.direction IN ('right', 'nudge')
  )
);
```

### 2. Frontend: Fetch org name + logo in `WhoIsInterestedSection`
After loading employer IDs, query:
```sql
SELECT om.user_id, o.name, o.logo_url
FROM organization_memberships om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id IN (...employer_ids) AND om.is_active = true
```
Add `org_name` and `org_logo` to the `InterestedEmployer` interface and display:
- Card: show org logo (if available) or profile image fallback; show org name as primary label
- Drawer: show org name + logo in the header; `employer_name` (personal name) as subtitle

### 3. Pass org data into `EmployerInterestDrawer`
Update the interface and rendering to display:
- Organization logo as the avatar (with personal image fallback)
- Organization name as the headline (with personal name as subtitle)
- Keep interest type badge and job listings unchanged

### Files to change
| File | Change |
|---|---|
| `supabase/migrations/...` | Add `swipe_targets_can_read_swiper_profiles` policy on `user_profiles` |
| `src/components/dashboard/WhoIsInterestedSection.tsx` | Fetch org memberships + org data; pass to cards + drawer |
| `src/components/dashboard/EmployerInterestDrawer.tsx` | Display org name/logo as primary identity |
