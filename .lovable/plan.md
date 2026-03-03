
## What We're Building

The demographics step in `AIOnboardingFlow.tsx` needs a two-tab redesign where BOTH tabs are always filled out — "As a Student" (formal education background, even for working professionals) and "As a Working Professional" (current career context, disabled for still-studying users).

This data feeds directly into: AI during onboarding, profile storage, and the `generate-match-summary` edge function which determines Promising / Good / Medium match tier for employers.

---

## Architecture — One Clean System, No Layers

**Single source of truth for this step**: The demographics state lives in `AIOnboardingFlow.tsx` → saved to `user_profiles` via `handleDemographicsSave()` → consumed by `generate-match-summary` edge function.

No new tables needed. The `user_profiles` table already has:
- `professional_stage` (student / working_professional)
- `academic_status`
- `major`
- `career_goal_type`

We add two new columns via migration:
- `work_experience_years` (text enum: none / 1-2 / 3-5 / 6-10 / 10+)  
- `current_industry` (text, freeform)
- `career_intention` (text enum, working professional goals)
- `still_studying` (boolean, for working professionals who are also in education)

---

## Step Design: Two Tabs, Always Both Filled

### Tab 1 — "As a Student" (education background)

Tab label changes: **"As a Student"** (was "I'm a Student")

Expanded `academic_status` options:
- `currently_studying` — Currently studying
- `final_year` — Final year student
- `recently_graduated` — Recently graduated (last 2 years)
- `graduated_university` — Graduated university (2+ years ago)
- `completed_college` — Completed college / technical diploma
- `finished_before_university` — Finished before university (secondary/high school)
- `self_taught` — Largely self-taught / no formal degree

Field of Study input (existing, keep as-is but relabeled: "Field of study or specialization")

Student Career Intention (for this profile section, rename from "Career Goal"):
- `first_job` — Get my first professional job
- `paid_internship` — Land a paid internship
- `grow_in_company` — Find a company to grow with long-term
- `continue_studying` — Continue studying before entering the workforce
- `not_sure` — Still figuring it out

### Tab 2 — "As a Working Professional" (career context)

Tab label: **"As a Working Professional"**

**"Still Currently Studying" toggle button** at the top — when active:
- Locks the entire tab 2 form (all fields go `opacity-50 pointer-events-none`)
- Still stores `still_studying: true` to signal they haven't entered the workforce yet
- A subtle message appears: "Complete this section once you've started your career journey"

When NOT still studying, form shows:
- **Current Role / Industry** (existing `major` field repurposed → keep `major` for student tab, add `current_industry` for professional tab)
- **Years of experience** (new field `work_experience_years`):
  - `none` — Just starting out
  - `1_to_2` — 1–2 years
  - `3_to_5` — 3–5 years
  - `6_to_10` — 6–10 years
  - `10_plus` — 10+ years
- **Career Intention** (expanded professional options, already exist for working_professional tab):
  - `get_promoted` — Get promoted in my current field
  - `switch_careers` — Switch careers or industries
  - `dream_job` — Land my dream job at a target company
  - `develop_skills` — Develop new skills for advancement
  - `start_something` — Start something of my own eventually
  - `work_life_balance` — Find better work-life balance
  - `earn_more` — Earn significantly more

---

## Validation Logic (canContinue)

```
Tab 1 always required: academic_status + major (field of study)
Tab 2 required if still_studying = false: current_industry + work_experience_years + career_intention_professional
Tab 2 if still_studying = true: no fields required, still_studying flag is enough
```

Both tabs must be visited (tracked via `visitedTabs` state: `Set<'student' | 'professional'>`).

canContinue = `visitedTabs.has('student') && visitedTabs.has('professional') && tab1Valid && tab2Valid`

---

## Data Save: `handleDemographicsSave()`

Save to `user_profiles`:
```ts
{
  professional_stage: still_studying ? 'student' : 'working_professional', // derived
  academic_status,           // tab 1
  major,                     // tab 1 field of study
  career_goal_type,          // tab 1 career intention
  current_industry,          // tab 2 (null if still_studying)
  work_experience_years,     // tab 2 (null if still_studying)
  career_intention_professional, // tab 2 (null if still_studying)
  still_studying,            // boolean
}
```

`professional_stage` is now **derived** from `still_studying`. If still_studying → 'student'. Otherwise → 'working_professional'. This preserves all downstream logic that reads `professional_stage`.

---

## AI Integration: `generate-match-summary` Edge Function

Add new fields to `candidateContext` block:

```ts
const candidateContext = `
...existing fields...
Education Background: ${candidateProfile.academic_status || 'Not specified'} — Field: ${candidateProfile.major || 'Not specified'}
Work Experience: ${candidateProfile.work_experience_years || 'Not specified'}
Current Industry: ${candidateProfile.current_industry || 'Not specified'}
Career Intention: ${candidateProfile.career_intention_professional || candidateProfile.career_goal_type || 'Not specified'}
Still Studying: ${candidateProfile.still_studying ? 'Yes — currently in education' : 'No'}
`;
```

Update system prompt to include the match tier classification:

```
Classify the match tier as one of:
- "Promising" — strong skills alignment, relevant experience, clear career goals matching employer needs
- "Good" — solid foundation but not as strong a match, some gaps but coachable
- "Medium" — some risks or misalignment, but potential with mentoring/coaching

Return JSON: { summary: string, match_tier: "Promising" | "Good" | "Medium" }
```

The employer browse UI already shows the AI insight — the `match_tier` value gets a visual badge beside it.

---

## DB Migration

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS current_industry TEXT,
  ADD COLUMN IF NOT EXISTS work_experience_years TEXT,
  ADD COLUMN IF NOT EXISTS career_intention_professional TEXT,
  ADD COLUMN IF NOT EXISTS still_studying BOOLEAN DEFAULT FALSE;
```

---

## Files to Change

| File | Change |
|---|---|
| `src/components/onboarding/AIOnboardingFlow.tsx` | Replace demographics step with two-tab design |
| `supabase/functions/generate-match-summary/index.ts` | Add new fields to candidateContext, add match_tier to prompt + response |
| `supabase/migrations/new.sql` | Add 4 columns to user_profiles |
| `src/integrations/supabase/types.ts` | Update Row types for user_profiles |

`StudentDemographicsStep.tsx` (inside `src/components/onboarding/student/`) is a SEPARATE component used by the older student onboarding path flow — update its `academic_status` options to match the expanded list for consistency, but it is NOT the primary component being changed here.

---

## What Stays Intact

- All other AIOnboardingFlow steps (welcome → skill → goal → summary) unchanged
- `professional_stage` field continues to work as before (now derived from `still_studying`)
- Employer and Mentor onboarding paths untouched
- Guard + UnifiedAuthProvider routing untouched
- Power Mirror, skill analysis, goal analysis steps unchanged
