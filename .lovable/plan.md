
## COMPLETE SYSTEM AUDIT: What We Know, What's Broken, and What Needs to Be Built

---

### THE DATA REALITY CHECK (Raw Numbers)

| Metric | Count | What It Means |
|---|---|---|
| Total users in system | 139 | — |
| Users with NO `last_active_at` | 72 (52%) | Half the user base is invisible to the tracking system |
| Users with NO `color_auto` | 71 (51%) | Half have no engagement classification at all |
| Users classified Red or untracked | 87 (63%) | Our "active" headline number is deeply misleading |
| Users whose ONLY post-onboarding action is `dashboard_visited` | ~91 | We can't tell if they actually used Lansa or just opened the tab |
| Unique users with `profile_updated` ever tracked | 1 | The most important seeker action is barely firing |
| Users with `pitch_generated` tracked | 0 | Defined in the type system but never fired in code |
| Users with `profile_shared` tracked | 0 | Same — defined but never fired |
| Users with `resume_export` tracked | 0 | Not even in the action type system |
| Users who applied to a job (`job_applied` action) | 0 | Not in the type system at all |
| Users who used AI Skill Reframer | tracked via user_power_skills table, never as user_action | — |
| Users who created a 90-day goal | 99 | Significant signal, completely untapped |
| Users who completed growth prompts | 83 completions | Used in color scoring but only 18 users have growth_stats |
| Segment emails sent total | 12 | System is barely warm |

---

### THE 5 CRITICAL SYSTEM FAILURES

#### Failure 1 — The Color Scoring Engine Uses Hollow Data

The `assign_user_color` SQL function calculates a user's engagement tier using:
- `last_active_at` (updated by `user_actions` trigger and chat messages)
- `user_actions` count in 7/30 days
- `user_growth_stats.total_completed`
- Profile completion fields (name, image, about, title, skills, experiences)

**The problem**: The vast majority of meaningful user activity in Lansa never gets written to `user_actions`. This includes:
- Visiting the profile builder and editing it (only 1 user has `profile_updated`)
- Using the AI Skill Reframer (saves to `user_power_skills` with no tracking call)
- Creating/updating a 90-day goal (99 users have done this, 0 actions logged)
- Running the AI coach/mirror (saves to `ai_mirror_reviews`, no tracking)
- Generating story builder content (saves to `user_stories`, no tracking)
- Exporting a CV/resume (saves to `resume_exports`, no tracking)
- Applying for a job (saves to `job_applications_v2`, no tracking)
- Swiping on job listings (saves to `swipes`, no tracking)

The engine is scoring users as "Drifting" and "Underused" when in reality many of them have done significant, meaningful things in the product — but on features that were never wired to `user_actions`.

#### Failure 2 — Profile Completion Score Is Misleading

The profile completion used in color scoring:
```
name: 20%, email: 10%, photo: 15%, about: 15%, title: 10%, skills: 15%, experience: 15%
```

Reality check on what users have:
- name: 139/139 (100%) — everyone has a name
- email: not directly counted but likely high
- photo: 9/139 (6%)
- about: 9/139 (6%)
- title: 6/139 (4%)
- skills: 22/139 (16%)
- experience: 17/139 (12%)

So the majority of users have a completion score of ~30% (name + email only). The system marks them as "Drifting" purely because of low profile completion — even if they've done 10 growth prompts, a 90-day goal, and 3 AI skill analyses. The scoring model is penalizing the wrong things.

For Lansa's actual job-to-be-done (help users build career positioning and get visible to employers), the **real** high-value actions are:
- Completing a 90-day goal
- Using the AI Skill Reframer
- Completing growth prompts
- Generating a profile pitch / story
- Being visible to employers
- Applying for jobs

None of these are in the scoring.

#### Failure 3 — Employer/Business Users Are In the System But Unclassified

`user_roles` has: 6 employer + 7 business role users. Their engagement goal is entirely different:
- Post a job listing
- Review applications
- Accept/reject candidates
- Open chat with a match
- Respond to messages

Currently: employer dashboard visits fire `dashboard_visited` but nothing else. Job posting, application review, acceptance/rejection — none of these fire into `user_actions`. Employers get scored by the same seeker-oriented color logic, which doesn't reflect their purpose at all.

The color system also has **no account-type separation** — a business user who posts a job and reviews 10 applications would still be scored as "Drifting" by the current engine because they never edited a profile, completed onboarding, or ran growth prompts.

#### Failure 4 — The Nudge Email System Is Firing on Wrong Data

The `send-segment-email` edge function is triggered by `color_auto` changes. Since color_auto is only being updated by the sparse `user_actions` records, segment emails are being sent based on:
1. How many times someone logged into the dashboard
2. Whether they have a photo and about text
3. How many growth prompts they completed

A user who runs the AI Skill Reframer 5 times, creates a 90-day goal, and applies for 3 jobs — but never opened the AI coach tab — will receive a "You're drifting, come back!" email. That's a false negative that will train users to ignore Lansa's emails.

12 emails sent total — the system is barely running.

#### Failure 5 — No Action Tracking on Employer-Facing Features

`EmployerDashboard.tsx` only fires `dashboard_visited`. The following employer actions exist in the DB but have zero tracking:
- `job_listings_v2`: Created jobs
- `job_applications_v2`: Status changes (review, accept, reject)
- `connection_requests`: Sending/accepting connections
- `matches`: Matching events
- `chat_threads`: Employer initiated a conversation

---

### WHAT NEEDS TO BE TRACKED — BY ACCOUNT TYPE

#### Seeker (Student/Professional) — Critical Actions

These are the "Jobs to Be Done" signals that prove a seeker is getting real value from Lansa:

| Action | Where It Happens | Currently Tracked? | DB Table Evidence |
|---|---|---|---|
| `profile_built` | After editing profile sections | No (barely) | `user_profiles.updated_at` |
| `power_skill_reframed` | AI Skill Reframer | No | `user_power_skills` |
| `goal_90day_created` | 90-Day Planner | No | `user_90day_goal` |
| `growth_prompt_completed` | Growth Hub | No | `user_growth_progress` |
| `story_created` | Story Builder | No | `user_stories` |
| `resume_exported` | Resume Designer | No | `resume_exports` |
| `job_applied` | Job feed → Apply | No | `job_applications_v2` |
| `job_swiped` | Job feed swipe | No | `swipes` |
| `visible_to_employers` | Visibility toggle ON | No | `user_profiles.visible_to_employers` |
| `pitch_generated` | Profile pitch tool | No (defined, never fired) | — |
| `profile_shared` | Share profile link | No (defined, never fired) | — |
| `ai_mirror_used` | AI Power Mirror | No | `ai_mirror_reviews` |
| `certification_started` | Cert flow | No | `cert_sessions` |
| `certification_completed` | Cert passed | No | `user_certifications` |
| `dashboard_visited` | Dashboard | YES | `user_actions` |
| `insight_opened` | AI Coach | YES | `user_actions` |
| `onboarding_completed` | Onboarding | YES | `user_actions` |

#### Employer/Business — Critical Actions

| Action | Currently Tracked? |
|---|---|
| `job_posted` | No |
| `application_reviewed` | No |
| `candidate_accepted` | No |
| `candidate_rejected` | No |
| `chat_opened_with_match` | No |
| `message_sent` | No |
| `connection_sent` | No |
| `dashboard_visited` | YES |

---

### THE COLOR SCORING MODEL NEEDS TO BE REBUILT

Current scoring thresholds assume seeker behavior only and use profile completion as a major signal. The rebuild needs:

**Per account type scoring with weighted signals:**

For seekers, the correct hierarchy of signals (highest → lowest value):
1. Job applied (strongest intent signal)
2. Resume exported / profile shared (output creation)
3. AI tool used (Skill Reframer, Mirror, Story Builder)
4. 90-day goal created
5. Growth prompt completed
6. Profile sections filled
7. Dashboard visited (weakest signal — just opening the app)

For employers, entirely separate thresholds based on:
1. Candidate accepted → chat opened (full-cycle completion)
2. Applications reviewed
3. Job posted
4. Dashboard visited

**Purple (Advocate)**: Should mean: using the product for its core purpose, creating outputs, coming back. Not just "certified + 4 action types + 7-day login."

**Green (Engaged)**: Active use of at least 2–3 key features in the last 30 days.

**Orange (Underused)**: Completed onboarding, has done some things, but stuck on 1 feature.

**Red (Drifting)**: Opened the app but hasn't done anything meaningful in 21+ days. OR onboarded but never came back.

---

### THE PLAN — WHAT WE NEED TO BUILD

#### Phase 1 — Fix Tracking Coverage (Backend + Frontend)

1. **Wire missing `user_actions` calls** across all high-value feature touchpoints:
   - `power_skill_reframed` → fire when `user_power_skills` row is inserted
   - `goal_90day_created` → fire when `user_90day_goal` row is inserted
   - `growth_prompt_completed` → fire when `user_growth_progress.is_completed` = true
   - `resume_exported` → fire when `resume_exports` row is inserted
   - `job_applied` → fire when `job_applications_v2` row is inserted
   - `visible_to_employers_enabled` → fire when `visible_to_employers` flipped to true
   - `story_created` → fire when `user_stories` row is inserted
   - Employer: `job_posted`, `application_reviewed`, `candidate_accepted`

   Best approach: **DB triggers** (not frontend calls) on the relevant tables → insert into `user_actions`. This guarantees tracking even if frontend calls fail or are missing.

2. **Extend the `ActionType` enum** in `actionTracking.ts` to include all new types.

#### Phase 2 — Rebuild the Color Scoring Logic

1. Update `assign_user_color` SQL function to:
   - Use weighted scoring based on account type (seeker vs employer)
   - Count high-value actions (job applied, AI tool used, resume exported) with higher weight
   - Reduce the weight of raw `dashboard_visited` count
   - Use `visible_to_employers` as a positive signal for seekers
   - Separate employer scoring completely

2. Run `update_all_user_colors` after deploying new logic to immediately reclassify all 139 users.

#### Phase 3 — Admin Area: Show Real Signal Data

The UserDrawer currently only shows: certified, last_active_at, color, intent, notes.

Needs to show:
- Action breakdown (how many of each key action type)
- Profile completion score with breakdown
- Feature usage heatmap (which tools they've used)
- Account type label (seeker / employer)
- Days since each key action
- Whether they're visible to employers

This gives the admin the data needed to make manual color decisions and write contextual notes.

#### Phase 4 — Improve Nudge Email Logic

Once tracking is accurate, update `send-segment-email` to:
- Send role-specific messages (seeker email ≠ employer email)
- Reference the specific feature they haven't used yet ("You set up a 90-day goal but haven't tried the AI Skill Reframer")
- Respect a minimum gap between emails per user (currently 24h — probably should be 3–7 days)

---

### SUMMARY OF WHAT'S NEEDED

```text
WHAT'S BROKEN TODAY                         IMPACT
───────────────────────────────────────────────────────────
52% of users have no activity tracking      Colors unreliable
95% of high-value actions never logged      Scores are wrong
Profile completion penalizes real users     False "Drifting"
Employers scored by seeker logic            Meaningless data
Nudge emails fire on wrong signals          Users ignore emails
UserDrawer shows almost no useful data      Admin can't act

WHAT WE BUILD                               OUTCOME
───────────────────────────────────────────────────────────
DB triggers on all key feature tables       100% coverage
Weighted, role-aware color scoring          Accurate segments
Admin drawer with full signal breakdown     Informed decisions
Role-specific nudge email content           Relevant outreach
```

This audit covers the **what and why**. The plan above is the build sequence. We should proceed in phases — starting with Phase 1 (tracking coverage via DB triggers) since everything else depends on accurate data going in.
