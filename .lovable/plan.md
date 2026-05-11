
# Profile Completion Engine — full rebuild

## Why rebuild
What exists today is fragmented and unreliable:

- `get-incomplete-signups` only flags users with **no** `user_profiles` row. The actual "drifting" user (signed up, made a profile row, filled almost nothing) is invisible to it.
- `send-onboarding-nudge` is **admin-manual only**, fires Resend directly, with no record of who got what or when. No cadence, no sequence, no dedupe.
- `RecommendedActions` on the dashboard pulls from a separate `actionPoints` util that doesn't know about completion state.
- No table tracks nudge history or completion score, so we can't reason about the funnel.

The new system is a single engine. Everything below replaces the old pieces — old files are deleted in the same change.

---

## 1. Source of truth: completion scoring

New SQL function `public.get_profile_completion(_user_id uuid)` returning:
```
{
  score: int (0..100),
  total_steps: int,
  completed_steps: int,
  missing: jsonb[]   // [{ key, label, weight, cta_route }]
}
```

Step catalog (job_seeker, weighted):
| key | weight | source check |
|---|---|---|
| onboarding_done | 20 | `user_answers.career_path_onboarding_completed = true` |
| basic_info | 10 | `user_profiles.name` not null |
| profile_photo | 10 | `user_profiles.avatar_url` not null |
| about_text | 15 | `length(about_text) >= 40` |
| title | 5 | `user_profiles.title` not null |
| experiences | 15 | `jsonb_array_length(experiences) >= 1` |
| skills | 10 | `jsonb_array_length(skills) >= 3` |
| education | 5 | `jsonb_array_length(education) >= 1` |
| languages | 5 | `jsonb_array_length(languages) >= 1` |
| visibility_on | 5 | `user_profiles.visible_to_employers = true` |

Score = sum of weights of completed steps. "Complete" means score ≥ 85.

A separate variant for `employer` is added later; the cron treats them with `user_type` filter.

---

## 2. New table: `profile_completion_state`

```
user_id uuid primary key references auth.users
user_type text                              -- 'job_seeker' | 'employer'
score int not null
missing_steps jsonb not null default '[]'
is_complete bool generated as (score >= 85) stored
completed_at timestamptz
last_score_at timestamptz default now()
last_nudge_sent_at timestamptz
nudge_sequence_step int default 0           -- 0..5
nudge_paused bool default false
created_at, updated_at
```

- RLS: user can `select` own row; admin can `select` all; service role writes.
- A `recompute_profile_completion(_user_id)` SQL function fills the row by calling `get_profile_completion`.
- Trigger fires on `user_profiles`, `user_answers` after insert/update → calls `recompute_profile_completion(NEW.user_id)`. This keeps scores fresh in real time without polling.

`nudge_history` table (append-only):
```
id, user_id, step, template_key, sent_at, email, resend_message_id, error
```
One row per email actually sent or attempted. Used for dedupe + admin visibility.

---

## 3. Automated email sequence (replaces `send-onboarding-nudge`)

Cadence after `auth.users.created_at`, only sent if `is_complete = false` AND `nudge_paused = false`:

| Step | Delay | Template key | Tone |
|---|---|---|---|
| 1 | 24h | `nudge_day1_welcome_back` | Soft: "you started, here's what's next" |
| 2 | 72h | `nudge_day3_what_youre_missing` | Value-focused: top 3 missing steps inserted dynamically |
| 3 | 7d | `nudge_day7_social_proof` | Outcomes others got from completing |
| 4 | 14d | `nudge_day14_last_push` | Direct: "we'll stop emailing soon" |
| 5 | 30d | `nudge_day30_goodbye` | Final, with one-click unsubscribe / "remind me later" |

Implementation: one new edge function `process-profile-nudges` (no auth, invoked by pg_cron):

1. Query `profile_completion_state` joined with `auth.users` where `is_complete = false`, `nudge_paused = false`, and the next step's delay has elapsed since `created_at`, and the user's `nudge_sequence_step < target_step`.
2. For each user, pick the appropriate template, call Resend (`noreply@notification.lansa.online`, in line with the Resend Domain Config memory), insert `nudge_history` row, bump `nudge_sequence_step`, set `last_nudge_sent_at`.
3. Built-in dedupe: never resend the same step to the same user; bail if a row already exists in `nudge_history` for that `(user_id, step)`.
4. Suppression: skip if `auth.users.email` appears in `suppressed_emails` (existing table from the email infra).

Scheduling: pg_cron job every 30 minutes calling the edge function. Job is created via the insert SQL tool (per project rules), not the migration tool.

Templates: React-ish HTML strings built in `_shared/onboardingNudgeTemplates.ts` (similar to current pattern), each accepting `{ firstName, missingSteps[], dashboardUrl }`. Single shared header/footer with brand styling (orange `hsl(14 90% 60%)`, deep blue `#191f71`, per Brand Design System v2 memory).

The current direct-Resend pattern is reused (the project is already on Resend with a verified subdomain). No migration to the Lovable email queue is required for this rebuild — but the helper centralizes the call so a future switch is one file.

---

## 4. In-app: `ProfileCompletionCard`

Single component on `/dashboard` and `/profile` (mounted only when `is_complete = false`):

- Top: ring progress + "Your profile is X% ready"
- Body: top 3 missing steps from `missing_steps`, each a row with label + "Add now" deep-link to the relevant section
- Footer: "Dismiss for today" (sets `nudge_paused` to true until tomorrow, client-side cookie + server flag)

Powered by a new `useProfileCompletion(userId)` hook reading from `profile_completion_state` (single query, no recomputation client-side).

The existing `RecommendedActions` block on the dashboard stays for users who **are** complete (it then shows growth actions, not completion actions). For incomplete users, `RecommendedActions` is hidden and `ProfileCompletionCard` takes its slot — no two competing CTAs.

---

## 5. Admin panel: `ProfileCompletionFunnelPanel`

Replaces `IncompleteSignupsPanel` in `AdminUsers`. Shows:

- Funnel header: total signups, % complete, % at each score bucket (0–25, 26–50, 51–84, ≥85)
- Table of incomplete users with: email, days since signup, score, missing steps count, last nudge step, last nudge sent at, pause toggle
- Bulk action: "Send next nudge now" — calls `process-profile-nudges` with `user_ids` override to force-advance the sequence for selected users
- Per-row action: "View nudge history" → drawer listing `nudge_history` rows

All data comes from `profile_completion_state` + `nudge_history` joined with `auth.users` via a new `admin-completion-funnel` edge function (admin-gated, service-role read).

---

## 6. Things deleted in this change

- `supabase/functions/send-onboarding-nudge/`
- `supabase/functions/get-incomplete-signups/`
- `src/components/admin/IncompleteSignupsPanel.tsx`
- All imports/uses of the above

`broadcast-segment-emails`, `send-segment-email`, `generate-onboarding-card` are unrelated and kept.

---

## 7. Technical details

```text
┌────────────────────────────────────────────────────────────┐
│ user_profiles / user_answers (writes)                      │
│        │ trigger                                           │
│        ▼                                                   │
│ recompute_profile_completion()  ──► profile_completion_state│
│                                              │             │
│           ┌──────────────────────────────────┴───────┐     │
│           ▼                                          ▼     │
│   useProfileCompletion (UI)            pg_cron / 30m       │
│           │                                          │     │
│           ▼                                          ▼     │
│   ProfileCompletionCard          process-profile-nudges    │
│                                              │             │
│                                              ▼             │
│                                   Resend ──► nudge_history │
└────────────────────────────────────────────────────────────┘
```

- Migration tool: create `profile_completion_state`, `nudge_history`, `get_profile_completion()`, `recompute_profile_completion()`, triggers, RLS, indexes (`idx_pcs_incomplete (is_complete, last_score_at)`).
- Insert tool (not migration): cron job scheduling `process-profile-nudges`.
- Edge functions: `process-profile-nudges`, `admin-completion-funnel`. CORS standard. `RESEND_API_KEY` already set.
- Backfill: a one-time call to `recompute_profile_completion` over every existing `auth.users` id at the end of migration so the table is populated before cron starts.

---

## Open questions before building

1. Cadence above is my proposal (1d / 3d / 7d / 14d / 30d, 5 emails). OK, or do you want fewer/different timings?
2. Should employers get the same sequence with employer-flavored copy, or only job_seekers in v1?
3. Tone preference: friendly-curious (current "you left something behind") vs. coachy-direct ("here's exactly what's blocking you")?
