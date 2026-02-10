

# Combined Fix: AI Modal Visual + Missing Content + Usage Limit Rule

## Part 1: Fix Modal Width and Missing Suggested Rewrite

### Problem
- The modal uses `max-w-3xl` but appears too wide/full-screen in some contexts
- For non-Skills sections (About Me, Biggest Challenge, Professional Goal), the AI-generated `suggested_rewrite` text is never rendered -- the code has an empty comment placeholder at line 189 of `AIModal.tsx`

### Fix (in `src/components/ai/AIModal.tsx`)
1. Change `max-w-3xl` to `max-w-5xl` on the modal container for better width constraint (~1024px)
2. Add a "SUGGESTED" display block after the quality badge and before the reasoning collapsible, which renders `aiResult.suggested_rewrite` in a green-bordered card for all non-Skills sections

---

## Part 2: One AI Enhancement Per Edit (Usage Limit Rule)

### How It Works

Each section tracks two pieces of state:
- **`contentHash`**: A snapshot of the content at the time AI was last used
- **`aiUsed`**: Whether the AI enhancement has been applied for this version of the content

```text
User writes/edits content
        |
        v
  AI button becomes available (content changed from last AI use)
        |
        v
  User clicks AI --> suggestion generated and shown
        |
        v
  User clicks "Apply Enhancement"
        |
        v
  aiUsed = true, contentHash = current content
  AI button becomes disabled (greyed out with tooltip: "Edit your content to unlock AI again")
        |
        v
  User edits the section content
        |
        v
  Content differs from contentHash --> aiUsed resets to false
  AI button becomes available again
```

### Implementation

**New prop on AIModal**: `disabled` -- when true, the "Apply Enhancement" button is disabled

**Each section component** (5 files) gets:
- `aiUsed` state (boolean) -- tracks if AI was applied for current content
- `lastAIContent` state (string) -- stores the content snapshot when AI was applied
- On content save/edit: compare new content to `lastAIContent`, if different, reset `aiUsed = false`
- On AI apply: set `aiUsed = true` and `lastAIContent = current content`
- AI button: disabled when `aiUsed === true` AND content hasn't changed

**Affected files:**
- `src/components/ai/AIModal.tsx` -- width fix + suggested rewrite display
- `src/components/profile/about/AboutMeSection.tsx` -- usage limit
- `src/components/profile/about/BiggestChallengeSection.tsx` -- usage limit
- `src/components/profile/sidebar/SkillsList.tsx` -- usage limit
- `src/components/profile/sidebar/BiggestChallengeWithAI.tsx` -- usage limit
- `src/components/profile/sidebar/ProfessionalGoalWithAI.tsx` -- usage limit

### UX Details

- When AI has been used and content hasn't changed, the AI button shows as **disabled** with reduced opacity
- A **tooltip** on hover explains: "Edit your content to use AI enhancement again"
- The cached AI result is also cleared when content changes, so opening the modal after editing always triggers a fresh AI call
- This is purely client-side state -- no database changes needed. State resets on page reload (intentional, since it's per-session usage gating)

---

## Technical Summary

| Change | File | What |
|---|---|---|
| Width fix | AIModal.tsx | `max-w-3xl` to `max-w-5xl` |
| Show suggested rewrite | AIModal.tsx | Add render block for `suggested_rewrite` for non-Skills sections |
| Usage limit | AboutMeSection.tsx | Track `aiUsed` + `lastAIContent`, disable AI button after apply |
| Usage limit | BiggestChallengeSection.tsx | Same pattern |
| Usage limit | BiggestChallengeWithAI.tsx | Same pattern |
| Usage limit | ProfessionalGoalWithAI.tsx | Same pattern |
| Usage limit | SkillsList.tsx | Same pattern (tracks skills join string) |

