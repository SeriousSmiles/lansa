
## Problem

The current `broadcast-segment-emails` function detects user type via `user_roles` table (checking for `employer`/`business` role). But the actual source of truth for user type is `user_answers.user_type` which is either `'job_seeker'` or `'employer'`. The roles table check is unreliable — employers may only have `'employer'` in `user_answers`, not necessarily a matching `user_roles` row.

More critically: the email body content currently blends both types. A job seeker gets mentions of job-posting features. An employer sees CV Builder and AI Mirror references. This is the core problem to fix.

**Job Seeker exclusive features** (from route guards in App.tsx):
- AI Skill Reframer / Power Skills
- AI Power Mirror
- CV Builder / Resume Editor
- Job Discovery feed
- Lansa Certification
- Growth Prompts
- 90-Day Goal Planner
- Opportunity Discovery

**Employer exclusive features** (from route guards in App.tsx):
- Post Jobs
- Browse Candidates
- Review Applications / Pipeline
- Organization Settings
- Candidate acceptance/shortlisting

---

## What Changes

### `supabase/functions/broadcast-segment-emails/index.ts` — only file changing

**1. Fetch `user_type` from `user_answers` in bulk**

Add a bulk query for all `user_ids` against `user_answers` to get `user_type`:

```typescript
const { data: allAnswers } = await serviceClient
  .from('user_answers')
  .select('user_id, user_type')
  .in('user_id', userIds);

const userTypeMap: Record<string, 'job_seeker' | 'employer'> = {};
allAnswers?.forEach(a => { userTypeMap[a.user_id] = a.user_type; });
```

Then replace the `isEmployer` detection from:
```typescript
const isEmployer = userRoles.some(r => ['employer', 'business'].includes(r));
```
to:
```typescript
const userType = userTypeMap[user.user_id] || 'job_seeker';
const isEmployer = userType === 'employer';
```

**2. Replace `buildEmailContent` with two separate builders**

`buildSeekerEmail(params)` — only ever mentions seeker features:
- Red: "AI Skill Reframer, Power Mirror, Job Discovery, CV Builder, Certification, Growth Challenges"
- Orange: Next unused seeker feature from the list above
- Green: Progress reinforcement + next seeker tool
- Purple: Advocate recognition with seeker achievements (jobs applied, certified, mirror used, skills reframed)

`buildEmployerEmail(params)` — only ever mentions employer features:
- Red: "Your hiring pipeline needs attention — come post a job or review your open applications"
- Orange: "You've started — next step is Browse Candidates or review incoming applications"
- Green: "You're actively hiring — keep reviewing candidates and shortlisting"
- Purple: "You're a hiring advocate on Lansa — recognition for consistent sourcing activity"

Both functions share the same HTML wrapper template. The subject lines, headlines, body copy, and CTA text are entirely separate and type-specific.

**3. Dispatch logic**

```typescript
const emailContent = isEmployer 
  ? buildEmployerEmail({ name, segment, actionCounts, certified })
  : buildSeekerEmail({ name, segment, actionCounts, certified, visibleToEmployers });
```

**4. Batch send with Resend batch API (already approved in previous plan)**

While we're editing the file, replace the sequential `resend.emails.send()` loop with `resend.batch.send()` in chunks of 100:

```typescript
// Build all payloads first
const emailPayloads = [];
const logRows = [];

for (const user of usersToProcess) {
  const content = isEmployer ? buildEmployerEmail(...) : buildSeekerEmail(...);
  emailPayloads.push({ from, to: [user.email], subject: content.subject, html: content.html });
  logRows.push({ user_id: user.user_id, old_segment: segment, new_segment: segment });
}

// Send in chunks of 100
const CHUNK_SIZE = 100;
for (let i = 0; i < emailPayloads.length; i += CHUNK_SIZE) {
  const chunk = emailPayloads.slice(i, i + CHUNK_SIZE);
  await resend.batch.send(chunk);
}

// Single bulk log insert
await serviceClient.from('segment_email_log').insert(logRows);
```

This resolves the rate-limit problem (2 API calls for 139 users) and the type-confusion problem in a single edit to one file.

---

## Summary of Changes

| File | Change |
|---|---|
| `supabase/functions/broadcast-segment-emails/index.ts` | Fetch `user_type` from `user_answers`, split into two typed email builders, switch to `resend.batch.send()` with chunking |

No other files change. The admin UI button, the result toast, and `segment_email_log` logging all stay exactly the same.
