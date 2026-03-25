
## What I Found in the Live Database

Running direct queries against the DB confirmed the exact problem scope:

```
total_users: 142
no_color:        2   ← users with NULL color_auto (not scored yet)
no_last_active:  48  ← 33% of users have NULL last_active_at
red_users:      120  ← 84% are Red, most incorrectly
green_users:     10
orange_users:     9
purple_users:     1
```

Of the 48 users with no `last_active_at`:
- 42 have a valid `last_sign_in_at` in `auth.users` — they DID log in, the table just never got updated
- 6 never signed in at all

The root causes are confirmed:

**Cause 1 — Missing frontend tracking calls** (previously identified)
- `profile_shared` — `handleShare()` in `useProfileActions.ts` makes the DB update but never calls `trackUserAction`
- `story_created` — `StoryBuilderFlow.tsx` calls `generateStory()` with no tracking
- `profile_updated` — `updateProfileData()` in `useProfileData.core.tsx` saves to DB with no tracking
- `resume_exported` — `PDFDownloadDialog.tsx` calls generators but never inserts into `resume_exports` table (DB trigger never fires)
- `pitch_generated` — no call site found in codebase

**Cause 2 — `last_active_at` never seeded from `auth.users`**
Users who signed up and browsed without triggering a tracked action have `last_active_at = NULL`. The scoring engine treats `NULL` as "never active from creation date" → 21+ days penalty → score halved → Red. This affects 42 real users.

**Cause 3 — No realtime or polling on the admin table**
`AdminUsers.tsx` runs a single fetch on mount. If another admin updates a user, or if a DB trigger fires and updates `color_auto`, the table shows stale data until the admin manually clicks "Export All CSV" or navigates away and back.

**Cause 4 — `Last Active` column shows only `last_active_at`**
The admin table shows "Never" for 48 users who actually signed in. `auth.users.last_sign_in_at` exists and is populated for 42 of them — it's just not shown.

---

## The Full Updated Plan

This is the existing plan (Onboarding State Machine refactor) PLUS the precision data layer work.

---

### Part A — Onboarding State Machine (previously approved, already implemented)

- `src/pages/Onboarding.tsx` — replace 5 boolean flags with single `OnboardingStep` enum
- `src/components/onboarding/student/StudentOnboardingContainer.tsx` — `default` case returns `null`
- Connect `onboardingFlowRegistry.ts` so routing is data-driven

Status: **Implemented in previous session.**

---

### Part B — Tracking Accuracy (5 missing signal wires)

**Fix 1 — `useProfileActions.ts`**
In `handleShare()`, after the `supabase.update({ is_public: true })` call succeeds, call `trackUserAction('profile_shared', { user_id: userId })`. Import `trackUserAction` from `@/services/actionTracking`.

**Fix 2 — `StoryBuilderFlow.tsx`**
In `handleGenerateStory()`, after `setGeneratedStory(result.story)` is called (line 101), fire `trackUserAction('story_created', { format_type: formatType, tone })`.

**Fix 3 — `useProfileData.core.tsx`**
In `updateProfileData()`, after the successful `supabase.update()` call (the `if (existingProfile)` branch), fire `trackUserAction('profile_updated', { fields: Object.keys(updatedData) })`. Only fires on actual save, not on new profile create.

**Fix 4 — `PDFDownloadDialog.tsx` (highest impact — 25pts)**
In `handleDownload()`, after any of the three generation calls succeed (before `setIsOpen(false)`), insert a row into `resume_exports`:
```ts
await supabase.from('resume_exports').insert({
  user_id: /* from supabase.auth.getUser() */,
  format: exportFormat,
  design_id: selectedTemplate
})
```
This fires the existing DB trigger `track_resume_exported` which inserts into `user_actions` and recalculates the user's color score.

**Fix 5 — `pitch_generated` (deferred)**
No pitch generation component was found in the codebase. This action type exists in the scoring algorithm but has no frontend implementation. Leave it defined — it will self-activate when the pitch feature is built.

---

### Part C — Admin Table Precision (new, addressing the core request)

**Fix 6 — Seed `last_active_at` from `auth.users` on login**
Create a DB migration that runs a one-time backfill AND creates an ongoing auth trigger:

**One-time backfill SQL (migration):**
```sql
UPDATE user_profiles up
SET last_active_at = au.last_sign_in_at
FROM auth.users au
WHERE au.id = up.user_id
  AND up.last_active_at IS NULL
  AND au.last_sign_in_at IS NOT NULL;
```
This immediately fixes the 42 users showing "Never" who actually have sign-in data.

**Ongoing trigger on `auth.users`:**
```sql
CREATE OR REPLACE FUNCTION public.sync_last_sign_in_to_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_active_at = NEW.last_sign_in_at
  WHERE user_id = NEW.id
    AND (last_active_at IS NULL OR NEW.last_sign_in_at > last_active_at);
  RETURN NEW;
END;
$$;
```
Note: Auth schema triggers require careful handling — this function is called via an existing pattern in the codebase (`handle_new_user` already uses `SECURITY DEFINER` on auth events). This ensures every future login updates `last_active_at` if the user hasn't done a tracked action more recently.

**Fix 7 — Backfill the 2 users with NULL `color_auto`**
Run `SELECT update_all_user_colors()` via a DB migration's `DO` block after the `last_active_at` backfill. This ensures no user in the table is ever "uncolored" — the scoring engine runs for every user.

**Fix 8 — Realtime subscription on `user_profiles` in `AdminUsers.tsx`**
Add a Supabase Realtime channel subscription so the admin table automatically reflects DB changes without requiring a manual refresh:
```ts
useEffect(() => {
  const channel = supabase
    .channel('admin-users-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_profiles'
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```
This means when a user's color updates via a DB trigger (e.g. they export a resume), the admin table updates within ~1 second automatically.

**Fix 9 — Show `last_sign_in_at` as fallback in the "Last Active" column**
In `AdminUsers.tsx`, the table currently shows "Never" for users with `last_active_at = NULL`. Update the column to show `last_sign_in_at` from `auth.users` as a fallback. This requires fetching `last_sign_in_at` alongside profile data. Since RLS blocks direct `auth.users` access from the client, expose it via a Supabase DB function:
```sql
CREATE OR REPLACE FUNCTION public.get_users_with_auth_data()
RETURNS TABLE(user_id uuid, last_sign_in_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id, last_sign_in_at FROM auth.users;
$$;
```
Then in `AdminUsers.tsx`, call this RPC alongside the `user_profiles` query and merge `last_sign_in_at` as the fallback display value.

---

### Summary of all files changing

| File | Change |
|---|---|
| `src/hooks/useProfileActions.ts` | Add `trackUserAction('profile_shared')` in `handleShare()` |
| `src/components/dashboard/story/StoryBuilderFlow.tsx` | Add `trackUserAction('story_created')` after story generation |
| `src/hooks/profile/useProfileData.core.tsx` | Add `trackUserAction('profile_updated')` after profile save |
| `src/components/pdf/PDFDownloadDialog.tsx` | Insert into `resume_exports` table on download success |
| `src/pages/admin/AdminUsers.tsx` | Add realtime subscription + fetch `last_sign_in_at` fallback |
| DB migration (new) | Backfill `last_active_at` from `auth.users`, run `update_all_user_colors()`, create `sync_last_sign_in_to_profile` function + trigger, create `get_users_with_auth_data` RPC |

### Expected outcome after implementation

| Metric | Before | After |
|---|---|---|
| Users with `NULL last_active_at` | 48 | 6 (only true never-logged-in) |
| Users with `NULL color_auto` | 2 | 0 |
| False Red classification | ~80% of Red users | Significantly reduced |
| Admin table staleness | Until manual refresh | ~1 second realtime |
| `Last Active` shows "Never" for real users | 42 users | 0 users |
