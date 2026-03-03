
## Full Audit: What's Static, Broken, or Misdirected in Employer Pages

### 1. Critical Data Issues Found

**EmployerAnalyticsTab.tsx** — Most broken file:
- Queries `job_listings` (old table) via `business_profiles.id` — this table/pattern is **obsolete**. Should use `job_listings_v2` with `organization_id`
- `totalViews` and `averageTimeToHire` are hardcoded as 0 / "N/A" — no query
- "Mutual Interests" and "Hires Made" in funnel are hardcoded as "Coming Soon" — `matches` table has this data

**EmployerOverviewTab.tsx** — Quick Actions not wired up:
- "Post a New Job" card has no `onClick` handler
- "Browse Candidates" card has no `onClick` handler
- Both are just `cursor-pointer` divs doing nothing

**MobileEmployerDashboard.tsx** — Recent Activity is hardcoded:
- "No recent activity" placeholder — never fetches from `notifications` table
- The "Manage Jobs" action card uses a `<Link to="/employer-dashboard">` — this is already the desktop route, on mobile this cross-navigates incorrectly (should switch to the jobs tab instead of navigating away)
- "Analytics" card has no `onClick` at all

**discoveryService.ts** — No swipe-exclusion filter:
- Previously identified: profiles reload all candidates including already-swiped ones on page refresh
- Needs to pre-fetch swipe history and exclude those `target_user_id`s before querying `user_profiles_public`

**MobileCandidateBrowser.tsx** — Empty state is minimal:
- Current empty state is 4 lines of plain text/icon with no stats
- Needs a high-quality branded "You're all caught up!" state

---

### 2. What Gets Fixed

#### File 1: `src/services/discoveryService.ts`
- Before the main query, fetch swipe history: `SELECT target_user_id FROM swipes WHERE swiper_user_id = userId AND context = 'employee'`
- Apply `.not('user_id', 'in', ...)` exclusion to the main `user_profiles_public` query
- If swipe list is empty, query runs unchanged (safe for new employers)

#### File 2: `src/components/mobile/employer/MobileCandidateBrowser.tsx`
- Redesign empty state: branded "You're all caught up!" with employer blue accent
- Show session stats (matches made, candidates reviewed from `swipes` count + `matches` count)
- Add "View Matches" button → `/chat` and "Back to Dashboard" button
- Remove the broken prefetch append (lines 123–128) that re-appends already-swiped candidates

#### File 3: `src/components/dashboard/employer/EmployerAnalyticsTab.tsx`
- Replace obsolete `business_profiles` + `job_listings` queries with `job_listings_v2` via `organization_id`
- Wire up `useOrganization()` hook to get `activeOrganization.id`
- Add real match count from `matches` table (already done for overview, replicate here)
- Add real applications funnel from `job_applications_v2`
- Add right-swipe count (total interest shown) separately from all swipes
- Replace "Coming Soon" funnel rows with real data: job postings, candidates viewed (swipes), mutual interests (matches), applications received
- `totalViews` → job interaction views from `job_interactions` table if available, otherwise remove that card

#### File 4: `src/components/dashboard/employer/EmployerOverviewTab.tsx`
- Wire "Post a New Job" card: `onClick={() => navigate('/employer-dashboard?tab=jobs')}`... actually since it renders inside the `EmployerDashboardTabs`, the parent should trigger tab switch. Change to accept `onPostJob` and `onBrowseCandidates` optional callbacks, or use tab query param navigation
- Wire "Browse Candidates" card: `onClick={() => navigate('/browse-candidates')}`

#### File 5: `src/components/mobile/employer/MobileEmployerDashboard.tsx`
- **Recent Activity**: Fetch last 5 `notifications` for the employer user (types: `employer_interest_received`, `match_created`, `chat_request_accepted`) from the `notifications` table. Show a clean notification list with icons + timestamps. If empty, show a better empty state message.
- **"Manage Jobs"** card: Replace `<Link to="/employer-dashboard">` with an `onManageJobs` callback prop that parent `MobileEmployerTabs` passes as `() => setActiveTab('jobs')` — prevents wrong-tab navigation on mobile
- **"Analytics"** card: Add `onClick` wired to `() => setActiveTab('analytics')` via same prop pattern

#### File 6: `src/components/mobile/employer/MobileEmployerTabs.tsx`
- Pass `onManageJobs={() => setActiveTab('jobs')}` and `onViewAnalytics={() => setActiveTab('analytics')}` down to `MobileEmployerDashboard`

---

### 3. Cross-User-Type Navigation Audit Result

After searching all employer pages:
- Routes `/employer-dashboard`, `/browse-candidates`, `/organization/settings` are all guarded with `<Guard types={['employer']}>` in `App.tsx` — no seeker can accidentally access them ✅
- `MobileEmployerDashboard` has `<Link to="/employer-dashboard">` on the "Manage Jobs" card — on mobile this navigates to the DESKTOP employer route, breaking mobile UX. This is the one bad link found.
- No other employer components link to `/dashboard` (seeker route) ✅

---

### Files to Modify (6 total, no DB migrations needed)

| File | Change |
|---|---|
| `src/services/discoveryService.ts` | Exclude already-swiped IDs before query |
| `src/components/mobile/employer/MobileCandidateBrowser.tsx` | Branded empty state + remove broken prefetch |
| `src/components/dashboard/employer/EmployerAnalyticsTab.tsx` | Fix to use `job_listings_v2` + `organization_id`, real matches/applications data |
| `src/components/dashboard/employer/EmployerOverviewTab.tsx` | Wire "Post Job" + "Browse Candidates" quick action buttons |
| `src/components/mobile/employer/MobileEmployerDashboard.tsx` | Real recent activity from notifications + fix mobile navigation links |
| `src/components/mobile/employer/MobileEmployerTabs.tsx` | Pass tab-switching callbacks to MobileEmployerDashboard |
