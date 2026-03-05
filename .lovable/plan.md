
## What the Current Trends Page Is Showing — And Where It's Wrong

### What Each Tab Currently Shows

**Distribution tab**: Pie chart + 4 colored cards showing how many users are in each engagement segment RIGHT NOW, based on `color_auto` (or `color_admin` if admin-overridden). This is accurate in real-time.

**Email Metrics tab**: A line chart of emails sent per day from `segment_email_log`. The data IS there (153 emails logged today alone) but the UI shows "4 Emails Sent" in the top card — this is a **data accuracy bug**: the summary cards are filtering to only `email_sent_at > startDate` but the hook query calculates `totalEmailsSent` from the email log, which only shows entries since today's re-scoring run. The chart itself shows the correct picture.

**Transitions tab**: Stacked bar chart showing which segment emails triggered transitions INTO (red/orange/green) on each day. This is sourced from `segment_email_log` — the bars show "emails that triggered a color change" not "users who changed segments". The label is misleading — it says "segment transitions" but it's actually email send events grouped by destination segment.

### The "Re-engagement" and "Recoveries" Confusion

- **Re-engagement** (currently = 1): Emails sent TO users whose `new_segment` = `red`. These are nudge emails sent when someone's score dropped to Drifting. The name "Re-engagement" is misleading — it sounds like "they came back" but actually means "we emailed them because they went drifting".
- **Recoveries** (currently = 1): Emails sent where `old_segment` = `red` AND `new_segment` != `red`. This means a user WAS drifting, then became more active, scored into orange/green/purple, and an email was triggered for that uplift. This is the POSITIVE metric — someone came back.

The real data (from direct DB query): 115 "to drifting", 11 recoveries, 15 to engaged, 19 to underused — today alone. The UI is showing stale/wrong counts because the `segment_email_log` table timestamps are all `2026-03-05 17:48:05` (the backfill run), so the 30-day window calculation is off.

### The 139 vs 145 User Discrepancy

The admin UI queries `user_profiles` (139 rows). Supabase `auth.users` has 145. The 6 missing users signed up but never completed onboarding — no `user_profiles` row was created for them. They are completely invisible to all admin tracking.

---

## The Plan

### 1. Fix the data accuracy problems in `useSegmentStatistics.ts`

The hook calculates:
- `reEngagementEmails` = emails where `new_segment === 'red'` — rename label to "Drifting Alerts Sent" 
- `recoveryEmails` = emails where `old_segment === 'red' AND new_segment !== 'red'` — rename to "Users Recovered"
- The `totalEmailsSent` count is correct but needs to include ALL-TIME or a clearly labeled time window

### 2. Add a new "Email Log" section to the Trends page

Show an actual table of emails sent: recipient name, from-segment → to-segment, date, email subject/type. This is what the admin specifically asked for ("I want to see what email was sent to users").

Data is already available in `segment_email_log` joined with `user_profiles`.

### 3. Rename metrics to be accurate and add tooltips everywhere

**Summary card labels:**
- "Re-engagement" → "Drifting Alerts" with tooltip: "Number of automated emails sent when a user's engagement score dropped to the Drifting (red) segment in the last 30 days. These are 'come back' nudges."
- "Recoveries" → "Recoveries" with tooltip: "Users who were previously Drifting (red) and moved to a higher segment (Underused, Engaged, or Advocate), triggering an encouraging email."

**Tab labels with tooltips:**
- "Distribution" → tooltip: "Current snapshot of all users grouped by engagement segment. Uses color_auto (calculated) unless an admin has manually set color_admin."
- "Email Metrics" → tooltip: "Daily count of automated nudge emails sent via segment changes. Each data point = a logged send event in segment_email_log."
- "Transitions" → tooltip: "Shows the destination segment of each automated email send event. A bar means 'an email was sent because a user moved INTO this segment on this day.'"

### 4. Add tooltips to ALL admin page components

**In `SegmentStatisticsWidget.tsx`:**
- Every summary card title/metric gets a `<Tooltip>` from Radix UI (already imported in the app)
- Tab triggers get tooltips explaining what each view shows
- Colored segment cards below the pie get tooltips explaining what Purple/Green/Orange/Red means

**In `AdminUsers.tsx`:**
- Stats bar at the top (Total, Active, Certified, color counts) get tooltips
- Filter labels in `EnhancedFiltersPanel` get tooltips
- Column headers in the user table get tooltips

**In `UserDrawer.tsx`:**
- "Days Inactive" tooltip: "Days since the user's last recorded action in user_actions or chat message sent."
- "Total Actions" tooltip: "Total count of tracked actions across all time, including dashboard visits, AI tool usage, job applications, and more."
- "Profile Score" tooltip: "Weighted completion score: Name 20%, Email 10%, Photo 15%, About 15%, Title 10%, Skills 15%, Experience 15%."
- Signal heatmap row tooltips: Per-signal explanations (e.g., "AI Mirror Used — number of times this user ran the AI Power Mirror review")
- "Manual Override" section tooltip: "Admin color overrides take precedence over the auto-calculated color_auto and will not be overwritten by the scoring engine."
- Intent stage radio options each get tooltip

### 5. Add the missing 6 auth users note

Add a small info banner to `AdminUsers.tsx` noting that `auth.users` count (145) exceeds profile count (139) — 6 users signed up but never completed onboarding.

---

## Files to Change

| File | Change |
|---|---|
| `src/components/admin/SegmentStatisticsWidget.tsx` | Add tooltips to all cards/tabs, add email log table, fix metric labels |
| `src/hooks/admin/useSegmentStatistics.ts` | Fetch email log with user names, fix label semantics |
| `src/components/admin/UserDrawer.tsx` | Add tooltips to all sections and signal rows |
| `src/pages/admin/AdminUsers.tsx` | Add tooltips to stat cards and the 6-user discrepancy notice |

No DB changes needed — the data is already there.
