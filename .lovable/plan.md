
## Root Cause Diagnosis

The shared profile link **IS technically broken for unauthenticated visitors** (anyone without a Lansa account). Here's exactly why:

### What's happening

1. The route `/profile/share/:userId` in `App.tsx` is **NOT wrapped in a `<Guard>`** — correct, it's public.
2. The page calls `supabase.from('user_profiles_public').select('*').eq('user_id', userId)`.
3. The RLS policy `"Public can view shared profiles"` has `USING (true)` — anyone should be able to read.
4. The profile **exists** in `user_profiles_public` for `a2dda0cd-eace-415d-a070-6cf6c8035ebe`.
5. The UUID regex in `useSharedProfileData` correctly extracts the ID from the slug.

**So why does it show "Profile not found"?**

The Supabase client used is the **standard anon client** — which is correct. But the `user_profiles_public` table was just converted to use **`WITH (security_invoker = true)`** in the last security migration. 

The `security_invoker = true` was applied to the **`catalogue_students` VIEW and `chat_participants_view` VIEW** — not the `user_profiles_public` TABLE itself. However, the **`catalogue_students` view** queries `user_profiles_public`, and if that view now enforces the caller's role, unauthenticated callers hitting `user_profiles_public` directly need just the table's RLS policies.

**The real problem:** Looking more carefully — the profile data IS in `user_profiles_public`, and the RLS allows public reads. The issue is that **`John Nathan Stehpens` has `is_public = false`** in `user_profiles`. The `sync_user_profiles_public` trigger logic says:

```
should_be_public := NEW.is_public OR (COALESCE(NEW.certified, false) AND COALESCE(NEW.visible_to_employers, false));
```

His `certified = true` and `visible_to_employers = true`, so `should_be_public = true` — his row **should** be synced. And it IS — confirmed the row exists in `user_profiles_public`.

**The actual bug: The `lansa.online` domain is a custom domain pointing to the Lovable preview/published app.** When someone opens `https://lansa.online/profile/share/john-...` they are NOT logged in. The Supabase client initializes with no session → `auth.role() = 'anon'`.

The `"Public can view shared profiles"` policy is `FOR SELECT USING (true)` — this grants both `anon` and `authenticated` roles access. **This should work.**

Let me check if there's a different issue — the URL `lansa.online` vs `lansa.lovable.app`. The route exists in the SPA, so deep links only work if the server redirects all paths to `index.html`. **This is the real issue**: the custom domain `lansa.online` may not have the SPA catch-all redirect configured, meaning `/profile/share/...` returns a 404 from the server rather than loading the React app.

**Additionally**: The Supabase client in the browser needs the profile URL to reach the Lovable app with proper SPA routing. The Lovable published app at `lansa.lovable.app` DOES have this configured. The custom domain `lansa.online` depends on how it was configured.

**To confirm the actual issue, test with:**
`https://lansa.lovable.app/profile/share/john-nathan-stehpens-a2dda0cd-eace-415d-a070-6cf6c8035ebe`

If that works but `lansa.online/...` doesn't → it's a custom domain SPA routing issue (requires dashboard fix, no code change needed).

If BOTH fail → there's a code/RLS issue.

## What I can fix in code (regardless of domain issue)

There is one genuine code bug: the `useSharedProfileData` hook uses the Supabase client which **might** have its session from the previous security fix affecting things. More importantly, I should add better error logging so it's easier to distinguish "no row found" vs "permission denied" vs "network error".

Also: the Supabase client query for public profiles should use the **service role** approach or at minimum ensure it's using the anon key correctly for truly public data.

## Plan

### 1. Add diagnostic logging in `useSharedProfileData`
Distinguish between RLS denial (403), no row (data is null), and network errors so we know exactly what's failing.

### 2. Ensure the Supabase client always reads `user_profiles_public` correctly for unauthenticated users
The anon client already should work. But as a safety measure — verify the query has no `.maybeSingle()` issues and returns proper error codes.

### 3. Show a more informative fallback
Instead of just "Profile not found", show different messages for:
- Profile is private (exists but not public)  
- Profile doesn't exist
- Network/auth error

### What requires manual action
- If `lansa.online` is the custom domain: check in the Lovable dashboard that **SPA routing / catch-all redirect** is enabled for the custom domain. All paths must return `index.html`.

## Files to change

| File | Change |
|---|---|
| `src/hooks/useSharedProfileData.ts` | Improve error handling to log the exact Supabase error code, distinguish null data from auth errors |
| `src/pages/SharedProfile.tsx` | Pass error state through, show contextual message |
| `src/components/profile/shared/ProfileNotFound.tsx` | Show contextual message based on error type |

The fix is small — the main investigation outcome is: **most likely this is a custom domain SPA routing issue**, but the code improvements will also surface exactly what's failing.
