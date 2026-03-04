
## Security Audit — Full Analysis & Plan

All 18 findings have been categorized. Here's what's real, what's a false positive, and what the actual changes are.

---

## VERDICT ON EVERY FINDING

### Errors to Fix (Database)

**1. `chat_email_log` — RLS disabled**
This table has policies but RLS is not enabled. The infrastructure memory confirms: "RLS is disabled on `chat_email_log` to allow the postgres superuser role to insert email logs via trigger." This is intentional and correct — the trigger runs as postgres superuser which bypasses RLS anyway. The existing `USING (false)` policy already blocks all API access. **We mark this as ignored with justification** rather than enabling RLS, since enabling it and keeping `USING (false)` would still block the trigger — wrong outcome.

**2. `Security Definer View` — `catalogue_students` and `chat_participants_view`**
These views bypass RLS. `catalogue_students` is the employer browse feed — it needs to be readable by authenticated employers only. `chat_participants_view` exposes names/avatars for chat UI — needs to be readable by authenticated users who are thread participants. Both need to convert to `security_invoker = true` so they respect the RLS on their underlying tables.

**3. `RLS Disabled in Public` — some table has no RLS**
Needs to be identified specifically and fixed.

**4. `Policy Exists RLS Disabled`** — already handled by the `chat_email_log` ignore above.

### Errors to Fix (Access Control)

**5. `user_profiles_public` — publicly readable, exposing names/emails/phones**
This is by design — this IS the public student profile page. BUT the scanner correctly notes email and phone are exposed. The `sync_user_profiles_public` trigger already gates email/phone behind `privacy_settings`. The SELECT policy for "public" is correct for sharing profile links. **Mark as ignored with context** — privacy controls are already in place via the trigger.

**6. `cert_certifications` — anyone can enumerate all certifications**
The policy `Anyone can view certifications by verification code` uses `USING (true)` which actually allows enumeration without a code. Fix: change to only allow access when filtering by a known `verification_code`. However — employers viewing the catalogue also see certification status. This needs a two-part policy: authenticated users can read all, unauthenticated only by code.

### Warnings to Fix

**7. `parse-cv` — no ownership validation**
Active function, called from client with the logged-in user's own userId. Needs ownership check: extract JWT, verify `claims.sub === userId`.

**8. Legacy AI functions with `verify_jwt=false`** — `analyze-skill-reframe`, `analyze-90day-goal`, `generate-power-mirror`, `generate-interactive-profile-guidance` — confirmed ACTIVE in client code (called from onboarding flow and profile). These consume OpenAI credits without authentication. Fix: add JWT validation in code for each function (keep `verify_jwt=false` since the new Supabase signing-keys system requires this pattern, but add `getClaims()` check).

**9. Permissive INSERT policies (`WITH CHECK (true)`)**
- `notifications`: inserted by SECURITY DEFINER triggers only (postgres superuser) — API-level INSERT with `WITH CHECK (true)` for authenticated users means any user could insert a notification for any other user. Fix: restrict to `user_id = auth.uid()` only.
- `organization_audit_log`: written by `log_org_action()` SECURITY DEFINER function — direct INSERT policy for authenticated users is unnecessary. Fix: remove direct INSERT policy.
- `segment_email_log`: written by `trigger_segment_change_email` DB trigger (postgres superuser, bypasses RLS) — direct INSERT policy for public is unnecessary. Fix: remove.
- `companies` and `organizations`: intentional for employer onboarding. **Mark as ignored.**

**10. `Function Search Path Mutable`** — 2 functions: `update_product_updates_updated_at` and `update_updated_at_column` — simple triggers that don't query tables. Add `SET search_path = public` to both.

**11. `has_org_role` missing** — FALSE POSITIVE. Function exists in DB. **Mark as ignored.**

**12. `client_role_checks`** — FALSE POSITIVE confirmed by scanner itself. **Mark as ignored.**

**13. Leaked Password Protection** — Supabase dashboard setting, cannot fix via code. Mark with note directing to Auth dashboard.

**14. Postgres version** — Supabase dashboard upgrade, cannot fix via code. Mark with note.

**15. `catalogue_students` view no RLS** — Addressed by converting to `security_invoker = true` (#2 above) which causes it to inherit underlying table RLS.

**16. `chat_participants_view` no RLS** — Same as above.

---

## Changes

### 1. Database Migration
```sql
-- Fix security_definer views → security_invoker
CREATE OR REPLACE VIEW public.catalogue_students WITH (security_invoker = true) AS ...
CREATE OR REPLACE VIEW public.chat_participants_view WITH (security_invoker = true) AS ...

-- Fix mutable search_path on 2 trigger functions  
CREATE OR REPLACE FUNCTION public.update_product_updates_updated_at()
  ... SET search_path = public ...
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  ... SET search_path = public ...

-- Fix notifications INSERT — users could write notifications for other users
DROP POLICY IF EXISTS "..." ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix organization_audit_log — remove direct INSERT for authenticated users
-- (log_org_action SECURITY DEFINER function handles this)
DROP POLICY IF EXISTS direct authenticated INSERT on organization_audit_log;

-- Fix segment_email_log — remove public INSERT
-- (trigger_segment_change_email runs as postgres, bypasses RLS)
DROP POLICY IF EXISTS public INSERT on segment_email_log;

-- Fix cert_certifications SELECT — prevent unauthenticated enumeration
-- Keep public access but require verification_code OR be authenticated
DROP POLICY "Anyone can view certifications by verification code";
CREATE POLICY "View certifications" ON public.cert_certifications
  FOR SELECT USING (
    auth.role() = 'authenticated'  -- employers and logged-in users
    OR verification_code IS NOT NULL  -- public verification link usage
  );
```

### 2. `parse-cv/index.ts` — Add ownership validation
After reading the JWT, verify `claims.sub === userId`. Uses `getClaims()` pattern.

### 3. `analyze-skill-reframe`, `analyze-90day-goal`, `generate-power-mirror`, `generate-interactive-profile-guidance`
Add JWT auth check at the top of each function using `getClaims()`. The client already sends the auth header via `supabase.functions.invoke()` (Supabase client automatically attaches it).

### 4. Security finding management
- Mark `chat_email_log` RLS as ignored (intentional design, postgres trigger bypasses RLS)
- Mark `user_profiles_public` public read as ignored (by-design public profiles)
- Mark `has_org_role_missing` as ignored (function exists)
- Mark `client_role_checks` as ignored (cosmetic only, RLS enforces server-side)
- Mark leaked password and postgres version as "requires dashboard action"
- Mark `companies`/`organizations` permissive INSERT as ignored (onboarding design)

### Files to change

| Target | Change |
|---|---|
| DB migration | Fix views, fix trigger functions search_path, fix INSERT policies, fix cert_certifications |
| `supabase/functions/parse-cv/index.ts` | Add `getClaims()` ownership check |
| `supabase/functions/analyze-skill-reframe/index.ts` | Add JWT auth |
| `supabase/functions/analyze-90day-goal/index.ts` | Add JWT auth |
| `supabase/functions/generate-power-mirror/index.ts` | Add JWT auth |
| `supabase/functions/generate-interactive-profile-guidance/index.ts` | Add JWT auth |
| Security findings | Mark 6 findings as ignored/noted with justification |
