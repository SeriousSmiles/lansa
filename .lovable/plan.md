
# Fix: Missing INSERT Policy on cert_certifications — The Silent Failure

## What Happened (Complete Chain)

```text
1. Casey takes exam → passes with score 84 ✅
2. cert_results INSERT succeeds ✅
3. ExamFlow.tsx calls: supabase.from('cert_certifications').insert(...) ❌
   └── RLS: no INSERT policy exists → silently blocked
4. cert_certifications row is never created
5. sync_cert_certification_to_user trigger never fires (nothing to trigger on)
6. user_certifications never updated
7. user_profiles.certified never set to true
8. Candidate never appears in employer browse feed
```

The trigger (`sync_cert_certification_to_user`) is healthy and correctly defined. It was never the problem. The problem is upstream: the row it needs to react to never gets written.

## Who Is Affected

All users who passed an exam but have no `cert_certifications` record:

| User | Sector | Score | Date |
|------|--------|-------|------|
| Casey Doran (`3f84cc75`) | Technical | 84 | Dec 16, 2025 |
| `981224b5` | Office + Service | 93 / 87 | Jan 18, 2026 |
| `6f58b5b2` | Digital, Technical, Service, Office | 100/97/92/96 | Jan 8, 2026 |

None of these users have a `cert_certifications` record. All are affected by the same missing policy.

## Fix Plan

### Part 1 — Database Migration: Add the missing INSERT policy

```sql
-- Allow authenticated users to insert their own certification record
CREATE POLICY "Users can insert their own certifications"
ON public.cert_certifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

This is the missing piece. Once added, every future exam pass will correctly write to `cert_certifications`, which fires the trigger, which updates `user_certifications` and `user_profiles`.

### Part 2 — Database Migration: Backfill all users who passed but have no cert record

Since the INSERT was silently blocked for all historical passes, we need to backfill `cert_certifications` for every user who has a passing `cert_results` entry but no corresponding `cert_certifications` row.

The backfill logic:
1. Find all `cert_results` where `pass_fail = true` with no matching `cert_certifications` by `result_id`
2. For each, insert a `cert_certifications` row (this will fire the trigger automatically, updating `user_certifications` and `user_profiles`)
3. Use `generate_cert_verification_code()` for unique codes

```sql
INSERT INTO public.cert_certifications (user_id, sector, level, result_id, verification_code, date_issued)
SELECT 
  cr.user_id,
  cr.sector,
  CASE WHEN cr.high_performer THEN 'high_performer'::certification_level ELSE 'standard'::certification_level END,
  cr.id,
  public.generate_cert_verification_code(),
  cr.created_at
FROM public.cert_results cr
WHERE cr.pass_fail = true
AND NOT EXISTS (
  SELECT 1 FROM public.cert_certifications cc WHERE cc.result_id = cr.id
);
```

This single INSERT handles Casey and all other affected users at once. The trigger fires once per row inserted, automatically cascading to `user_certifications` and `user_profiles`.

## Files to Modify

| File | Change |
|------|--------|
| New migration | Add INSERT RLS policy on `cert_certifications` |
| New migration | Backfill `cert_certifications` for all historical passes |

## No Code Changes Required

`ExamFlow.tsx` already has the correct insert call. The fix is purely at the database policy level. Once the policy exists, the existing code works correctly for all future exams.

## Expected Result After Fix

- Casey Doran appears in the employer browse feed (certified)
- Users `981224b5` and `6f58b5b2` also get their certifications properly created and will appear if their profiles are public/complete
- All future exam passes automatically write `cert_certifications` → trigger fires → `user_certifications` updated → candidate visible in feed
- No more silent failures

## Note on Casey's Correction

Casey already has a `user_certifications` record from the manual fix applied earlier. The backfill migration uses `ON CONFLICT` safety and the trigger uses `ON CONFLICT DO UPDATE`, so running the backfill will not create duplicates — it will safely update the existing record if one exists.
