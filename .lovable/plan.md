

# Fix: Extract Profile/Bio Paragraph from CV Regardless of Section Name

## Problem
The CV parser's extraction prompt only asks for a `"Professional summary if present"`, which causes the AI to miss the personal bio/about paragraph when it appears under different headings like "Profile", "Bio", "About Me", "Personal Statement", "Objective", "Introduction", etc. This is one of the most common and valuable sections in a resume, but its label varies wildly.

## Fix (Single File Change)

**File: `supabase/functions/parse-cv/index.ts`** — lines 48-53 of the system prompt

Update the `personalInfo.summary` field description to explicitly instruct the AI to look for this content under any common heading:

```
Before:
"summary": "Professional summary if present (2-3 sentences max)"

After:
"summary": "The candidate's personal/professional bio paragraph. This section goes by many names: 'Profile', 'About Me', 'Bio', 'Summary', 'Personal Statement', 'Objective', 'Introduction', 'Professional Summary', 'Career Summary', 'Personal Profile', or similar. Extract the full text of this paragraph — it is the section where the candidate describes themselves in their own words. Do NOT invent one if none exists."
```

Also add a reinforcing bullet in the "Focus on" list at the bottom of the prompt:

```
- The personal bio/profile paragraph (look for ANY free-text section describing the person, regardless of its heading name)
```

## Why This Works
The AI model reads the full CV image. It already "sees" the bio paragraph — the problem is the prompt doesn't emphasize that it should capture it. By listing the common aliases and describing what the content looks like (a free-text paragraph where someone describes themselves), the model will reliably extract it regardless of the heading used.

## Downstream Impact
No changes needed downstream. The extracted `summary` field already maps to `about_text` in `cvDataService.ts` (line 152), which populates the user's profile bio section correctly.

