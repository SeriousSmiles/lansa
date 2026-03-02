
# Fix: Employer Cannot See Certified Candidates — Missing Role or Wrong RLS Policy

## What Is Actually Happening

The employer (user `e599bc17`) visits /browse-candidates. The app queries `user_certifications` to get the list of certified user IDs. That query returns **0 rows** — not because no certified users exist (there are 5), but because the RLS SELECT policy blocks the employer from reading them.

The SELECT policy on `user_certifications` is:

```sql
-- Current policy: only allows reading if user has 'business' role
(user_id = auth.uid()) 
OR (has_role(auth.uid(), 'business') AND lansa_certified = true AND verified = true)
OR has_role(auth.uid(), 'admin')
```

The employer has **no role** in `user_roles`. So all three conditions fail. The query silently returns `[]`. The app then finds zero certified profiles to show and displays "You've reviewed all certified candidates."

## Why This Is a Systemic Problem

Any employer who does not have the `business` role assigned will see zero candidates, even if many certified users exist. This is a missing onboarding/registration step: employer accounts are not being granted the `business` role when they sign up or complete onboarding.

## Two-Part Fix

### Part 1 — Fix the RLS Policy (Immediate, Correct)

The `user_certifications` SELECT policy should allow **any authenticated user** to read basic certification status (`lansa_certified`, `verified`, `user_id`) for verified certified users. This is non-sensitive public status information — it is the whole point of the certification system that employers can see who is certified.

Replace the restrictive policy with one that allows all authenticated users to view verified certifications:

```sql
-- Drop the old business-role-gated policy
DROP POLICY IF EXISTS "Business users can view verified certifications only" ON public.user_certifications;

-- New: any authenticated user can see verified certifications (public status)
CREATE POLICY "Authenticated users can view verified certifications"
ON public.user_certifications
FOR SELECT
TO authenticated
USING (
  (user_id = auth.uid())
  OR (lansa_certified = true AND verified = true)
);
```

This is safe because:
- Own record: always visible (for candidate's own dashboard)
- Other users: only the certified+verified flag is queryable — unverified/uncertified records remain invisible
- No sensitive personal data is exposed — `user_certifications` only holds certification status

### Part 2 — Auto-Assign `employer` Role on Signup (Prevent Recurrence)

The underlying cause is that employers are never assigned a role. The fix should also include assigning a role to the employer user so future role-based features work correctly.

Create a database trigger that assigns the `employer` app_role when a new user completes employer onboarding (i.e., `user_type = 'employer'` is set in `user_answers`), OR apply a migration to backfill roles for all existing employer accounts.

```sql
-- Backfill: assign 'employer' role to all users who are employers with no role
INSERT INTO public.user_roles (user_id, role)
SELECT ua.user_id, 'employer'::app_role
FROM public.user_answers ua
WHERE ua.user_type = 'employer'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = ua.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;
```

Note: This requires `employer` to exist in the `app_role` enum. We will check and add it if missing.

## Files to Modify

| Change | Type |
|--------|------|
| New migration: fix RLS policy on `user_certifications` | Database |
| New migration: backfill employer roles | Database |

## Expected Result After Fix

- All authenticated employers can see the certified candidate list in /browse-candidates
- The "You've reviewed all certified candidates" message only appears when they have genuinely swiped through everyone
- Future employer signups automatically get the employer role and will not hit this issue
- No sensitive data is exposed — only `lansa_certified = true AND verified = true` records are visible to others
