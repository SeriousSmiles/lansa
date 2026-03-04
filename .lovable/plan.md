
## Problem

When an employer receives a `job_application_received` notification, clicking it (in-app) or the CTA button in the email should take them directly to the job's applicants list with the review drawer open. Right now:

- **In-app notification**: `action_url` is set to `/dashboard/jobs/${job_id}/applicants` (a route that doesn't exist). Nothing happens.
- **Email CTA**: The email passes `applicantsUrl: https://lansa.online${action_url}`, which is the same broken path.

## Solution

The employer dashboard doesn't use URL routes for tabs or drawers — it's a single-page component. The correct approach is to use URL search params to carry intent, then read them on load to open the right tab + sheet.

### How it will work

1. **New action_url format** in `apply-for-job-v2/index.ts`:  
   Change from `/dashboard/jobs/${job_id}/applicants`  
   To `/employer-dashboard?tab=jobs&jobId=${job_id}`

2. **`EmployerDashboard.tsx`**: Read `?tab=jobs&jobId=xxx` from the URL using `useSearchParams`. If present, pass `defaultTab="jobs"` and `openJobId={jobId}` as props down to `EmployerDashboardTabs`.

3. **`EmployerDashboardTabs.tsx`**: Accept `defaultTab` and `openJobId` props. Initialize `activeTab` from `defaultTab`. Pass `openJobId` to `JobManagementTab`.

4. **`JobManagementTab.tsx`**: Accept `openJobId?: string` prop. On mount (after jobs load), if `openJobId` matches one of the listings, call `setSelectedJobId(openJobId)` + `setShowApplicationsSheet(true)` automatically.

5. **Backfill migration**: Update existing `job_application_received` notifications that have the old `action_url` format to use the new one.

### Files to edit

| File | Change |
|---|---|
| `supabase/functions/apply-for-job-v2/index.ts` | Change `action_url` to `/employer-dashboard?tab=jobs&jobId=${job_id}` |
| `src/pages/EmployerDashboard.tsx` | Read URL params, pass `defaultTab`/`openJobId` down |
| `src/components/dashboard/EmployerDashboardTabs.tsx` | Accept + forward `defaultTab`, `openJobId` |
| `src/components/dashboard/employer/JobManagementTab.tsx` | Accept `openJobId`, auto-open `ApplicationsSheet` on mount |
| SQL migration | Fix existing notification `action_url`s |

The email CTA (`applicantsUrl`) in `send-chat-email/index.ts` will automatically use the correct URL since it reads from `action_url`.
