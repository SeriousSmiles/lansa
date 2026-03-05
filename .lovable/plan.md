
## What Needs to Be Built

### Request Summary
1. **Broadcast emails to all 139 users** — each user gets an email based on their current segment (red/orange/green/purple), designed to nudge them toward the next tier. Purple users get an "Advocate — well done" email.
2. **Product Updates trigger email notifications** — when a product update is published, all users with an email get notified via Resend.
3. **Admin can verify 139 accounts received the email.**

---

### Current State Analysis

**Segment emails today:**
- `send-segment-email` only fires on `color_auto` *transitions* (DB trigger). It will never send to users whose color doesn't change.
- The function skips purple entirely (line 41–48) — only red, orange, and red→green/orange recovery trigger emails.
- There is no batch broadcast capability anywhere.

**Product Updates today:**
- `product_updates` table exists, admin can create/publish updates.
- Users see them in-app via `user_seen_updates` table.
- **No email notification exists** — nothing fires when an update is published.

---

### What Will Be Built

#### Part 1 — Broadcast Email Edge Function (`broadcast-segment-emails`)

A new edge function callable by admin that:
1. Fetches all 139 `user_profiles` with `email`, `name`, `color_auto`, `certified`, `visible_to_employers`, `user_id`
2. For each user, fetches their `user_actions` counts and `user_roles`
3. Determines the segment email to send:
   - **Red** → "Don't let your progress fade" — nudge toward first high-value action
   - **Orange** → "You're building momentum" — suggest next feature they haven't used
   - **Green** → "You're on fire — keep going" — encourage consistency + next tool
   - **Purple** → NEW: "You're a Lansa Advocate — great work" — recognition email
4. Respects a rate-limit: skips users who received a segment email within the last 5 days (checks `segment_email_log`)
5. Logs each send to `segment_email_log` with `old_segment = current_color, new_segment = current_color` (same-segment broadcast marker)
6. Returns a results summary: `{ sent: 127, skipped_rate_limited: 10, skipped_no_email: 2 }`

The Purple/Advocate email template needs to be **built** — it doesn't exist in `send-segment-email` today (that function skips all transitions to green/purple unless coming from red).

**Admin trigger:** A new "Send Segment Emails" button on the AdminTrends page (next to the existing admin actions area), with a confirmation dialog and result toast.

#### Part 2 — Product Update Email Notification (`send-product-update-email`)

A new edge function that:
1. Accepts `{ update_id }` in the request body
2. Fetches the `product_updates` row (title, description, category, version, link_url, icon_name)
3. Fetches all 139 emails from `user_profiles` where `email IS NOT NULL`
4. Sends a branded HTML email to every user with:
   - Update title, category badge (Feature/Improvement/Fix/Announcement), description
   - Version badge if present
   - CTA button linking to `https://lansa.online/dashboard` (or `link_url` if provided)
   - Lansa branding consistent with other emails
5. Returns `{ sent: N, failed: M }`

**DB trigger on `product_updates`:** When `published_at <= now()` and the update transitions to published state, fire the edge function. Since Supabase doesn't support conditional schedule triggers easily, we'll use an **INSERT trigger** + a check: only fire if `published_at <= NOW()` (i.e. not a future-scheduled post). Scheduled posts will need the admin to manually send, so we add a "Send Email Notification" button on the AdminUpdates page.

**AdminUpdates UI:** Add a "Notify Users" button per update row (only visible for published/past updates) that calls the edge function.

#### Part 3 — Broadcast Result Visibility (AdminTrends)

Add a new "Broadcast" section to `SegmentStatisticsWidget.tsx`:
- "Send Segment Emails to All Users" button with confirmation dialog
- After completion: shows result (e.g., "127 emails sent, 10 rate-limited, 2 had no email")
- This calls the new `broadcast-segment-emails` function using the admin's auth token

#### Part 4 — Purple/Advocate Email Template

Add a new `buildAdvocateEmailContent()` into both the `send-segment-email` and `broadcast-segment-emails` functions. Template:
- Subject: `You're a Lansa Advocate, [Name] — thank you`
- Headline: `You're at the top, [Name]. We see you.`
- Body: Recognition for consistent use, encouragement to share Lansa, mention of their achievements (certified if applicable, jobs applied, AI tools used)
- CTA: "See Your Impact" → dashboard

---

### Files to Create/Edit

| File | Action | What |
|---|---|---|
| `supabase/functions/broadcast-segment-emails/index.ts` | **CREATE** | Batch email function for all 139 users |
| `supabase/functions/send-product-update-email/index.ts` | **CREATE** | Product update notification to all users |
| `src/components/admin/SegmentStatisticsWidget.tsx` | **EDIT** | Add broadcast button + result summary |
| `src/pages/admin/AdminUpdates.tsx` | **EDIT** | Add "Notify Users" button per published update |
| `supabase/functions/send-segment-email/index.ts` | **EDIT** | Add purple/advocate email template + fix green transition |
| `supabase/config.toml` | **EDIT** | Register new functions with `verify_jwt = false` |

---

### Rate Limiting Strategy

The broadcast function checks `segment_email_log` for entries within the last 5 days. This means:
- Users who already got a segment email recently (from score transitions) will be skipped.
- First-time broadcast will hit most of the 139.
- The admin sees exactly how many were sent vs skipped.

To ensure the **Advocate (purple) email** can also be sent to users who recently got a different segment email (it's a recognition, not a nudge), we'll use a different log key: `old_segment = 'purple', new_segment = 'purple'` as a distinct check — only skip if they received a purple email within 5 days.

---

### No DB Migration Needed

All data is already in place:
- `segment_email_log` already tracks sends
- `user_profiles` has emails
- `product_updates` table exists
- No new tables required
