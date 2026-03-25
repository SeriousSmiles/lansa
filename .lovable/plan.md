
## Full System Map (Investigation Findings)

### Current Flow (to be changed)
```
Register → /onboarding → UserTypeSelection → CareerPathSegmentation 
  → AIOnboardingFlow (5 steps: welcome, demographics, skill, goal, summary)
  → markOnboardingComplete() → navigate('/profile') → PostOnboardingChoice modal
```

### What `hasCompletedOnboarding` means (Guard.tsx + UnifiedAuthProvider)
The `onboarding` prop on Guard routes checks `hasCompletedOnboarding` from context. This is true only when BOTH:
- `user_profiles.onboarding_completed = true` (new flag)  
- OR `user_answers.career_path_onboarding_completed = true` (old flag)
- AND `user_answers.user_type` is set

The `/dashboard`, `/profile`, `/jobs`, `/certification`, and all job seeker routes require this flag. This is the GATE we need to move.

### What the AI Onboarding Sequence actually stores
The sequence saves to 3 tables:
1. `user_profiles` — `professional_stage`, `academic_status`, `major`, `career_goal_type`, `still_studying`, `current_industry`, `work_experience_years`, `career_intention_professional`
2. `user_power_skills` — `original_skill`, `reframed_skill`, `business_value_type`, `ai_category`
3. `user_90day_goal` — `goal_statement`, `ai_interpretation`, `initiative_type`, `clarity_level`

### ALL downstream AI features that consume this data (critical dependency map)

**1. `analyze-profile-section` edge function** (About Me AI, Skills AI, Professional Goal AI, Biggest Challenge AI)
- Reads: `user_answers.identity`, `user_answers.desired_outcome`, `user_profiles.title`, `user_profiles.professional_goal`, `user_profiles.skills`
- Context used: generic (identity, goal, title) — NOT the deep demographics
- Impact level: LOW — works generically even without onboarding data

**2. `generate-about-template` edge function** (AboutStep guided setup)
- Reads: `userAnswers` (full object) and `profile` (full object)
- Uses whatever is in `user_answers` and `user_profiles` to personalize the template
- Impact level: MEDIUM — works but gives generic results without demographics

**3. `generate-skills-recommendations` edge function**
- Reads: `currentSkills`, `userAnswers`, `profile`
- Same pattern — uses whatever context is available
- Impact level: MEDIUM

**4. `ProfileDataUtils.processSkillsData/processExperiencesData/processEducationData`**
- Falls back to `answers.identity` (old field) to generate placeholder profile data
- The `identity` field is from the OLD onboarding (pre-career-path), not the new AI flow
- Impact level: LOW — this is fallback behavior anyway

**5. `useProfileData` → `loadProfileData`**
- Calls `getUserAnswers(userId)` and uses `answers.identity` + `answers.career_path` for `role` and `goal` display on profile
- These come from `user_answers` table fields, not from the AI sequence tables
- Impact level: LOW — these fields get populated during the type/path selection step which stays in onboarding

**6. `Dashboard.tsx`** — reads `userAnswers.ai_insight`, `userAnswers.identity`, `userAnswers.career_path`, `userAnswers.desired_outcome`
- These come from `user_answers` table — set during the early type/path selection which still happens
- Impact level: LOW

**7. `useHireRateScore` hook** — reads `user_power_skills` and `user_90day_goal`
- These are only populated AFTER the AI sequence is complete
- Impact level: MEDIUM — HireRate score will show as 0/empty until user completes the AI sequence

### The 3 core AI dependency problems to solve

**Problem 1 — "Activate Your Personal AI" gate**
When user clicks the AI sparkle button on About Me, Skills, Professional Goal, or Biggest Challenge — the `analyze-profile-section` function runs but has no deep professional context (no `academic_status`, `major`, `professional_stage`, `work_experience_years`). The AI output will be generic.

**Solution**: Show a soft unlock prompt when these fields are empty, inviting the user to "Activate Your Personal AI" which opens the AI Career Plan sequence. After completion, the AI enhance buttons work with full personalization.

**Problem 2 — `PostOnboardingChoice` still expects to fire after onboarding**
Currently `ProfilePage.tsx` opens the PostOnboardingChoice modal if `location.state?.fromOnboarding` is set. If we skip the AI flow in onboarding, this state won't be set anymore. The modal also fires when profile core fields are missing (which is always true for new users).

**Solution**: The PostOnboardingChoice modal logic stays as-is — it's triggered by missing profile fields, not by onboarding. This is exactly what we want: new users hit `/profile` and immediately get prompted to upload CV or fill manually. No change needed here.

**Problem 3 — `hasCompletedOnboarding` must be satisfied WITHOUT the AI sequence**
Currently, `markOnboardingComplete()` is only called at the END of the AI sequence (`AIOnboardingFlow.handleComplete()`). If we skip the AI sequence, no flag is set and the user gets bounced back to `/onboarding`.

**Solution**: Call `markOnboardingComplete()` immediately after `CareerPathSegmentation` completes (in `handleCareerPathSelect` in Onboarding.tsx). The user_type and career_path are already set at this point. This is the minimal viable "onboarding complete" moment.

### What the new flow looks like
```
Register → /onboarding → UserTypeSelection → CareerPathSegmentation 
  → markOnboardingComplete() immediately → navigate('/profile')
  → PostOnboardingChoice modal (CV Upload or Manual) 
  → /dashboard has "Activate Your AI" growth card
  → When user opens the AI Career Plan → full AIOnboardingFlow runs as embedded dashboard flow
  → AI enhance buttons unlock with full personalization
```

### Routing safety analysis
- All routes with `onboarding` Guard prop will now work because `hasCompletedOnboarding` gets set right after career path selection
- `/profile`, `/dashboard`, `/jobs`, `/certification` — all unlocked
- No changes needed to Guard.tsx or DefaultRoute.tsx
- The `/onboarding` page itself: after `markOnboardingComplete` is called, `DefaultRoute` would redirect away from `/onboarding` if user re-visits. This is correct behavior.
- `navigateAfterOnboarding` from `useOnboardingNavigation` is already used in the business flow — we just move job_seeker to use it too via `handleCareerPathSelect`.

### Existing users (data migration safety)
- Users who already completed the AI sequence: `hasCompletedOnboarding = true`, `user_power_skills` populated. Nothing changes.
- Users stuck mid-AI-sequence: they have `user_type` set but no `onboarding_completed` flag. They currently get redirected to `/onboarding`. After this change, we add a small check: if `user_type` and `career_path` are both set, mark complete immediately on the onboarding page load and redirect to profile/dashboard. This unsticks these users.

---

## The Plan

### Files to Change

**1. `src/pages/Onboarding.tsx`**
- In `handleCareerPathSelect`: after saving career path to DB, call `markOnboardingComplete(user.id, 'job_seeker')`, then `refreshUserState()`, then `navigate('/profile', { replace: true, state: { fromOnboarding: true } })`
- Remove the `careerPath && userType === 'job_seeker'` branch that renders `<AIOnboardingFlow />` — the AI sequence no longer lives here
- In the initial `useEffect` (load existing progress): add recovery logic — if `user_type` is set AND `career_path` is set but onboarding is NOT complete, auto-complete and redirect (unsticks stuck users)
- Keep the `AIOnboardingFlow` import removed, keep everything else intact (business, org, mentor flows unchanged)

**2. New component: `src/components/dashboard/overview/AICareerPlanCard.tsx`**
- A dashboard growth card that invites the user to "Build Your AI Career Plan"
- Checks if `user_power_skills` is empty for this user (simple DB count query)
- If empty: shows an inviting card — "Unlock personalized AI coaching" with a CTA button
- If complete: shows a summary card — "AI Profile: Active" with their reframed skill and goal snippet
- On click: opens `AICareerPlanModal`

**3. New component: `src/components/dashboard/overview/AICareerPlanModal.tsx`**
- A full-screen modal (or dedicated sheet) that embeds the existing `AIOnboardingFlow` component
- Passes `onComplete` callback — on complete, closes modal and refreshes the card state
- Reframes the experience: title is "Build Your Career Goal Plan" — no "onboarding", no "test", no scores visible in title

**4. Update `src/components/dashboard/overview/OverviewTab.tsx`**
- Add `<AICareerPlanCard />` below the `ListingActivationCard` section
- This keeps it visible but not as the very first thing — profile/CV remains the first magic moment

**5. Update `src/components/onboarding/AIOnboardingFlow.tsx`**
- Add an `onComplete` prop (callback) — used when running as a dashboard modal vs. standalone onboarding
- When `onComplete` prop is provided: call it instead of `navigate()` at the end
- Do NOT call `markOnboardingComplete()` again from within this flow (already called at career path step)
- Remove the direct navigation to `/profile` from `handleComplete` when invoked from dashboard context

**6. New component: `src/components/profile/about/AIActivationPrompt.tsx`**
- A subtle inline nudge shown in the About Me section when `user_power_skills` is empty
- Small banner: "Personalize your AI coach — complete your Career Goal Plan for tailored suggestions"
- Link/button navigates to `/dashboard` with a state flag `{ openAIPlan: true }` to auto-open the modal
- Shown ONLY when: userId exists AND AI enhance is attempted AND no power skills data exists

**7. Update `src/components/profile/about/AboutMeSection.tsx`** (and `SkillsList.tsx`)
- Before calling `fetchAISuggestion`, check if `user_power_skills` is empty for this user
- If empty: instead of calling the AI, show the `AIActivationPrompt` — "Your AI works better with your Career Goal Plan. Complete it for personalized suggestions, or continue with general suggestions"
- Two options: "Activate AI (2 min)" → opens career plan, "Use General AI" → proceeds with current behavior

**8. Update `src/pages/Dashboard.tsx`**
- Check for `location.state?.openAIPlan` and if true, pass a prop down to OverviewTab to auto-open the AICareerPlanModal
- Clear the state after reading it

### What does NOT change
- Guard.tsx — no changes
- DefaultRoute.tsx — no changes  
- All employer, mentor, business onboarding flows — no changes
- All existing user data — fully preserved
- The AI sequence itself (AIOnboardingFlow content) — reused as-is, just embedded in a modal
- PostOnboardingChoice modal logic — works as-is (triggered by missing profile fields)
- All Supabase edge functions — no changes needed

### Summary for the user

The new experience:
1. User registers → picks role → picks career path → immediately lands on `/profile`
2. CV upload or manual fill modal appears — first magic moment (profile creation)
3. Dashboard shows a prominent "Build Your AI Career Plan" action card — clearly optional but valuable
4. When user is ready, they complete the 5-step AI sequence inside a modal on the dashboard
5. Once complete, all AI enhance buttons on profile gain full personalization context
6. If user tries AI enhance on profile before completing the plan, they get a clear, friendly prompt explaining the benefit — not a blocker

The onboarding sequence data is preserved in the same tables. The AI quality difference between "generic" and "personalized" is communicated to users as a reason to complete the plan, not as a gate.
