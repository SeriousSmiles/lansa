## Why the AI keeps getting "student vs professional" wrong

I traced the path end-to-end. The selector on the profile page works, but the rest of the system **does not honor it**. Three real root causes:

### 1. Most users have no value at all
`user_profiles.professional_stage` is set for **15 of 171 users** (6 student, 9 working_professional). The other **156 users are NULL**. The AI is literally guessing for the majority.

### 2. The AI prompts never receive the field, even when it's set
Audit of every AI edge function that writes "you sound like a…" copy:

| Function | Sees `professional_stage`? |
|---|---|
| `analyze-profile-section` (the 1-edit "AI suggest" button on every section) | **No** — context only includes identity, desired_outcome, title, professional_goal, skills |
| `generate-title-suggestions` | Function expects `currentTitle, userAnswers, profile`. **Client only sends `{ userId }`** → all three arrive as `undefined`. Pure hallucination. |
| `generate-about-template` / `generate-goal-template` / `generate-challenge-template` / `generate-skills-recommendations` | Client sends a `profile` object that **omits `professional_stage`** |
| `ai-profile-stylist` | Dumps the full profile but the system prompt never tells the model the stage matters |
| `generate-power-mirror` | Hard-codes `'Generate the power mirror for this student.'` — assumes everyone is a student |
| `parse-cv` | Already reads it correctly (this one works) |
| `generate-match-summary` | Reads `still_studying` only |

### 3. The selector on the profile page is buried
It sits between the personal-info card and the skills list in the right sidebar with no visual weight, no required-state, no warning when missing. Users skip past it, the field stays NULL, see #1.

---

## The fix (no new layers, just tightening what exists)

### A. Make the field always have a value

1. **Backfill migration** for the 156 NULL rows using deterministic signals from data they already gave us:
   - `still_studying = true` → `student`
   - `work_experience_years` ≥ 1 OR any `experiences` entry → `working_professional`
   - `user_answers.career_path = 'student'` → `student`
   - otherwise leave NULL and treat as "unknown" (AI will be told "stage unknown — write neutrally")
2. **Add a NOT NULL-style guard at the application layer** (not a DB CHECK, since stage can change): when the profile loads and `professional_stage` is missing, the existing `ProfessionalStageSelector` is promoted to a banner at the top of the profile until set.

### B. Make the selector unmissable on the profile page
- Move `ProfessionalStageSelector` out of the middle of the sidebar to the **top of the profile main column**, rendered as a single-row pill chooser (Student / Working Professional) with a clear "This drives every AI suggestion" caption.
- When NULL: show as a soft warning card ("Pick one so the AI describes you correctly").
- When set: collapse to a compact chip the user can click to change.

### C. Make every AI prompt honor the field as a hard rule

Single shared helper in `supabase/functions/_shared/` so we don't drift again:

```ts
// _shared/professionalStage.ts
export function stageDirective(stage: string | null) {
  if (stage === 'student') return `
USER STAGE: STUDENT.
Hard rules:
- Frame them as a current/recent student building toward their first roles.
- Do NOT invent years of professional experience, prior job titles, or seniority.
- Achievements come from coursework, projects, internships, volunteering.
- Tone: ambitious, learning-oriented, curious.`;
  if (stage === 'working_professional') return `
USER STAGE: WORKING PROFESSIONAL.
Hard rules:
- Frame them as someone with real work experience seeking the next step.
- Do NOT call them a student, recent grad, or "aspiring" anything.
- Lead with measurable workplace outcomes, not coursework.
- Tone: confident, results-driven, peer-to-peer with hiring managers.`;
  return `
USER STAGE: UNKNOWN.
Hard rules:
- Use neutral language. Do not assert student status or years of experience.
- Avoid words like "student", "recent graduate", "seasoned", "veteran".`;
}
```

Then thread it into each function's system prompt as a top-of-prompt block (above the existing instructions, so it can't be overridden by the rest):

- `analyze-profile-section` — fetch `professional_stage` alongside `userProfile`, prepend `stageDirective()` to `systemPrompt`, and add a line to the user `context` block.
- `generate-title-suggestions` — **fix the client first** to actually send `{ userId, currentTitle, userAnswers, profile }` (today only `userId` is sent). Then prepend the directive.
- `generate-about-template`, `generate-goal-template`, `generate-challenge-template`, `generate-skills-recommendations` — extend the client `profile` payload to include `professional_stage`; have each function prepend the directive.
- `ai-profile-stylist` — read `profile.professional_stage` and prepend the directive.
- `generate-power-mirror` — replace the hard-coded `"…for this student."` user message with a stage-aware string built from the directive.

### D. Verification (so we know it actually changed behavior)

- After backfill: re-query distribution; expect <10% NULL.
- For each touched AI function: run one student fixture and one working_professional fixture through the dev tools and visually confirm the wording changes.

---

## Technical notes

- Migration is data-only (`UPDATE user_profiles SET professional_stage = …`) — uses the **insert tool**, not a schema migration.
- No new tables, no new columns, no new flags. We use `professional_stage` (already on `user_profiles`) as the single source of truth and stop reading the legacy `still_studying` boolean from anywhere except `parse-cv` / `generate-match-summary` (those keep working but also receive `professional_stage` so they can prefer it).
- No client-side AI gate-keeping — the directive lives in the prompt so it survives every retry and follow-up.
- The shared helper is a single file; if we ever add a new AI function the rule is "import `stageDirective`, prepend it" — that's the whole governance.