
## Root Cause Analysis — Complete

After deep investigation, there are **multiple distinct issues** causing the "can't chat with some users" problem. Here's what I found:

---

### Issue 1 — `chat_participants_view` missing business users (CRITICAL)

**6 `business`-role users have NO `user_profiles` row.** The `chat_participants_view` is built on `user_profiles` as its base table:

```sql
SELECT up.user_id, up.name, ...
FROM user_profiles up
LEFT JOIN organization_memberships om ON ...
LEFT JOIN organizations o ON ...
```

If a business user has no `user_profiles` row → they **do not appear in the view** → when the other party loads their thread, `chatService.getThread()` calls `chat_participants_view` and gets nothing back → `other_party` is `undefined` → the chat UI renders a broken/blank thread.

**The 6 affected users:** `48a87477`, `872a4772`, `e88ae5b7`, `8cb9e87a`, `d52a18a4`, `24df69fd` (all `business` role, all have `business_profiles` but no `user_profiles`).

---

### Issue 2 — `chat_participants_view` doesn't use `business_profiles` as fallback

Even for employer users who **do** have `user_profiles`, their name often comes from employer onboarding (stored in `business_profiles.company_name`), not in `user_profiles.name`. Several employer users show a blank `name` in `user_profiles`. The view never looks at `business_profiles` at all.

---

### Issue 3 — No fallback display in `chatService` when `other_party` is null

In `chatService.getThreadsForUser()` and `getThread()`, if `participantMap.get(otherPartyId)` returns nothing (because the user has no `user_profiles` row), `other_party` is set to `undefined`. The chat UI then silently fails to show thread info or crashes rendering.

---

### The Fix Plan

#### Fix 1 — Update `chat_participants_view` to also pull from `business_profiles`

Alter the view to `UNION` or `LEFT JOIN` `business_profiles` so business users who lack `user_profiles` entries still appear:

```sql
CREATE OR REPLACE VIEW public.chat_participants_view AS
SELECT 
  up.user_id,
  COALESCE(NULLIF(up.name, ''), bp.company_name) AS name,
  up.profile_image,
  up.title,
  om.organization_id,
  COALESCE(o.name, bp.company_name) AS organization_name,
  o.logo_url AS organization_logo
FROM user_profiles up
LEFT JOIN organization_memberships om ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN organizations o ON o.id = om.organization_id
LEFT JOIN business_profiles bp ON bp.user_id = up.user_id

UNION

-- Business users who have business_profiles but NO user_profiles row
SELECT 
  bp.user_id,
  bp.company_name AS name,
  NULL AS profile_image,
  bp.company_name AS title,
  NULL AS organization_id,
  bp.company_name AS organization_name,
  NULL AS organization_logo
FROM business_profiles bp
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = bp.user_id);
```

This ensures all users (whether they completed `user_profiles` or only `business_profiles`) appear in the view.

#### Fix 2 — Defensive fallback in `chatService.ts`

When `other_party` is `undefined` (participant not found in view), fall back to showing their org name from `business_profiles` or a sensible default instead of silently breaking. Add a direct `business_profiles` lookup as fallback in `getThread()` and `getThreadsForUser()`.

#### Fix 3 — Supabase migration to run the view update

A single SQL migration alters the view. No RLS changes are needed (the view already inherits `user_profiles` RLS, and `business_profiles` RLS allows authenticated reads).

---

### Files to change

| Change | Location |
|---|---|
| SQL migration — alter `chat_participants_view` to include business_profiles fallback | New migration in `supabase/migrations/` |
| Defensive fallback for missing `other_party` in thread enrichment | `src/services/chatService.ts` |

### What this fixes

- Business users with only `business_profiles` now appear in thread lists and thread headers
- Employer users with blank `user_profiles.name` now show their company name instead
- All matched/accepted users can see and communicate in their threads without silent failures
