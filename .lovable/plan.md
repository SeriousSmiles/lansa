
## Diagnosis — Confirmed Gap

**The employer notification pipeline for job applications is completely missing.** Here's what exists vs. what's needed:

| Step | Exists? |
|---|---|
| Candidate submits application via `apply-for-job-v2` | ✅ |
| Notification inserted into `notifications` table for employer | ❌ |
| `trigger_chat_notification_email` fires → sends email | ❌ (no notification row = no trigger) |
| `job_application_received` email template | ❌ |

The `apply-for-job-v2` edge function inserts the application record and records an interaction — but never creates a `notifications` row for the employer and never sends an email. The DB trigger `trigger_chat_notification_email` only fires when a row is inserted into `notifications` and only handles specific types (`chat_request_received`, `match_created`, etc.) — `job_application_received` is not one of them.

## What to Build

### 1. Add notification insert inside `apply-for-job-v2`
After successful application insert, also insert a row into `notifications` for the employer (`job.created_by`):
```
type: 'job_application_received'
user_id: job.created_by  ← employer
title: 'New application received!'
message: '[Candidate Name] applied for [Job Title]'
action_url: '/dashboard/jobs/[job_id]/applicants'
metadata: { applicant_id, job_id, application_id, applicant_name }
```

### 2. Add `job_application_received` to `trigger_chat_notification_email` DB trigger function
Update the allowed `notification_type` whitelist in `trigger_chat_notification_email()` to include `job_application_received` — so the pg_net call to `send-chat-email` fires.

Currently the trigger function has:
```sql
IF NEW.type NOT IN (
  'chat_request_received', 'chat_request_accepted', 'message_received',
  'employer_interest_received', 'employer_nudge_received', 'match_created'
) THEN RETURN NEW;
```
Add `'job_application_received'` to this list.

### 3. Add `job_application_received` handler in `send-chat-email`
Add a new branch that generates the employer notification email using a new `generateJobApplicationEmail` template.

### 4. Add `generateJobApplicationEmail` template in `_shared/emailTemplates.ts`
Clean, professional email to the employer:
- Subject: "New application for [Job Title]"
- Body: candidate name, job title, cover note preview (if any), CTA button → employer job applicants page
- Style: matches existing template system (blue header, white body)

## Files to Edit

| File | Change |
|---|---|
| `supabase/functions/apply-for-job-v2/index.ts` | Fetch applicant name + job title, insert `notifications` row for employer after successful application |
| `supabase/functions/send-chat-email/index.ts` | Add `job_application_received` handler branch |
| `supabase/functions/_shared/emailTemplates.ts` | Add `generateJobApplicationEmail` function + interface |
| DB migration | Update `trigger_chat_notification_email` function to include `job_application_received` in the whitelist |

## Flow After Fix

```
Candidate clicks Apply
    ↓
apply-for-job-v2 inserts application
    ↓
apply-for-job-v2 inserts notification row (type: job_application_received) for employer
    ↓
trigger_chat_notification_email DB trigger fires
    ↓
net.http_post → send-chat-email edge function
    ↓
generateJobApplicationEmail → Resend → employer inbox
```

Rate limiting already built-in (15 min guard in `chat_email_log`) — employer won't be spammed if multiple candidates apply quickly.
