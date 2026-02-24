

# Fix CV Mismatch Block + Add Student/Working Professional Selection to Onboarding

## Three Issues Identified

### Issue 1: "Review Profile" button does nothing
In `EnhancedCVAnalysisResults.tsx` (line 156), the "Review Profile" button has no `onClick` handler -- it's a dead button. It should either navigate users to their profile page or scroll to the relevant section.

### Issue 2: Mismatch logic assumes everyone is a "student"
The `parse-cv` edge function (line 194) generates misleading warnings like *'CV shows "Creative Specialist" but your career goal is "student"'*. The mismatch logic compares against the raw `academic_status` value (e.g., "final_year", "studying") rather than accounting for working professionals. This creates confusing, inaccurate warnings for professionals using the Career Advancement path.

### Issue 3: No student vs. working professional distinction in onboarding
The "Career Advancement" path (formerly "Student") only offers student-oriented options in the demographics step:
- "Final year student"
- "Recent graduate"  
- "Currently studying"

There's no option for working professionals. This affects the entire downstream system: profile generation, AI coaching tone, CV gap analysis, and future matchmaking.

---

## Solution

### Step 1: Add `professional_stage` column to `user_profiles`
A new database column to store whether the user is a **student** or **working professional**. This is separate from `academic_status` (which captures student-specific details) and `career_goal_type` (which captures intent).

- Column: `professional_stage` (text, nullable)
- Values: `'student'` or `'working_professional'`
- No enum needed -- simple text column keeps it flexible for future additions

### Step 2: Redesign the Demographics step in AIOnboardingFlow
Replace the current student-only demographics with a two-phase approach:

**Phase 1 -- Professional Stage selector** (new, first question):
- "I'm a Student" -- studying, recently graduated, or about to graduate
- "I'm a Working Professional" -- currently employed, seeking better opportunities

**Phase 2 -- Conditional follow-up questions**:

If **Student** is selected:
- Academic Status: Final year / Recent graduate / Currently studying (existing options)
- Field of Study (existing)
- Career Intention: Get my first job / Find a paid internship / Grow within a company (existing options)

If **Working Professional** is selected:
- Current Role/Industry (text input, replaces "Field of Study" contextually)
- Years of Experience: 1-3 years / 3-7 years / 7+ years
- Career Intention: Get promoted / Switch careers / Land dream job at target company / Develop new skills

This saves `professional_stage` to `user_profiles` alongside the existing `academic_status`, `major`/field, and `career_goal_type` fields.

### Step 3: Update the `parse-cv` edge function mismatch logic
- Remove the hardcoded assumption that all Career Advancement users are "students"
- Use `professional_stage` from `user_profiles` to generate contextually accurate warnings
- For working professionals, compare CV title against career goal, not student status
- Adjust the "extensive work experience but student status" warning to only trigger for actual students

### Step 4: Fix the "Review Profile" button
Add an `onClick` handler to navigate to `/profile` or dismiss the mismatch card and let users continue to their profile after onboarding.

### Step 5: Enable changing professional stage in Profile settings
Add a "Professional Stage" selector in the profile editor so users can switch from student to working professional (or vice versa) as their life changes. This updates `user_profiles.professional_stage`.

---

## Technical Details

### Database Migration
```sql
ALTER TABLE user_profiles ADD COLUMN professional_stage text;
```

### Files Modified
1. **`src/components/onboarding/AIOnboardingFlow.tsx`** -- Redesign demographics step with professional stage selection, conditional follow-up questions, and save `professional_stage` to database
2. **`supabase/functions/parse-cv/index.ts`** -- Update mismatch warning logic to use `professional_stage` instead of assuming student
3. **`src/components/onboarding/cv/EnhancedCVAnalysisResults.tsx`** -- Add `onClick` to "Review Profile" button
4. **`src/components/profile/ProfilePage.tsx`** (or relevant profile editor component) -- Add professional stage selector for post-onboarding changes

### AI Coaching Adaptation
The AI coaching prompts in the skill and goal steps already receive `demographicsData` as context. By including `professional_stage`, the AI will naturally adjust its tone:
- Students: "As you prepare to enter the workforce..."
- Professionals: "With your experience in the field..."

### Matchmaking Impact
The `professional_stage` column becomes available for the future matchmaking system to distinguish between entry-level candidates (students) and experienced professionals seeking advancement, enabling more accurate employer-seeker matching.

