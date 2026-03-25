
## Full Audit Summary

### Two separate visibility systems — both broken in different ways

**System 1: `is_public` — Shareable profile link**
- What it does: Makes the `/profile/share/[name]-[id]` URL viewable by anyone
- DB column: `user_profiles.is_public` (boolean)
- Status:
  - `ProfileCard.tsx` reads `isProfilePublic` correctly from `useProfileData` ✅
  - `ProfileNotFound.tsx` sets `is_public: true` correctly ✅
  - `DesktopProfileActions.tsx` (the hamburger menu on `/profile`) has its own LOCAL `useState(false)` — it **never reads from DB** and **never initializes from `profileData.isProfilePublic`** ❌
  - The toggle in the hamburger menu is **permanently disabled** unless the user has a cert with "lansa" in the name field — this is a fragile string match on `userProfile.certifications`, not the actual `user_certifications` table ❌
  - Result: The toggle in the profile page hamburger menu is always OFF and always locked

**System 2: `visible_to_employers` — Employer browse feed**
- What it does: Makes the user appear in the employer candidate browse catalogue
- DB column: `user_profiles.visible_to_employers` (boolean)
- Status:
  - `ListingActivationCard.tsx` reads and updates correctly ✅
  - Gated correctly behind `user_certifications.lansa_certified = true` ✅
  - Works well — no changes needed here

---

## What needs fixing

### The core problem in `DesktopProfileActions.tsx`
1. `const [isProfilePublic, setIsProfilePublic] = useState(false)` — ignores the `profileData.isProfilePublic` that IS already fetched from DB (it calls `useProfileData(userId)` but doesn't use its `isProfilePublic` value)
2. Certification gate uses string-match on `userProfile?.certifications` — wrong source
3. The label "Lansa Only" is confusing — `is_public` (shareable link) should be available to ALL users, not just certified ones. The certification gate should only apply to `visible_to_employers`

### Clarity problem for users
The current UI has ONE "Profile Visibility" toggle with a vague "Public/Private" label. Users don't understand:
- What "public" means (is it to employers? to anyone? for the link?)
- Why it's locked
- What they need to do to unlock it

---

## Plan

### File 1: `src/components/profile/header-actions/DesktopProfileActions.tsx`

**Problem:** Local state ignores DB value. Certification gate is wrong.

**Fix:**
1. Remove `const [isProfilePublic, setIsProfilePublic] = useState(false)` — replace with `profileData.isProfilePublic` (already fetched from DB on line 61)
2. Remove the `isLansaCertified` string-match hack entirely
3. The `is_public` toggle should be available to **all users** (no gate). Any user can share their profile link
4. Update `handleMakeProfilePublic` to call `supabase.update({ is_public: !profileData.isProfilePublic })` and rely on the hook's state, then call a local refresh
5. Split the visibility section into two clearly labeled toggles:

```
Toggle 1: "Shareable Profile Link"
  Icon: Link icon (Globe)
  Subtitle when OFF: "Off — your profile URL is private"
  Subtitle when ON:  "On — anyone with the link can view it"
  Available to: ALL users (no gate)

Toggle 2: "Appear to Employers"  [only shown if certified]
  Icon: Briefcase / Eye
  Subtitle when OFF: "Off — not visible in employer search"
  Subtitle when ON:  "On — employers can find you"
  Available to: certified users only (reads from user_certifications)
```

This replaces the existing single vague toggle.

### File 2: `src/hooks/useProfileData.tsx`

**Addition:** Expose an `updateIsPublic` function from the hook (similar to `updateProfessionalGoal`) so the toggle in `DesktopProfileActions` can update state through the hook rather than bypassing it with local state. This keeps the DB update and state in sync.

```ts
const updateIsPublic = async (value: boolean) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_public: value })
    .eq('user_id', userId);
  if (!error) setIsProfilePublic(value);
};
```

Return it in the hook's return object.

### File 3: `src/hooks/profile/profileTypes.ts`

Add `updateIsPublic: (value: boolean) => Promise<void>` to the `ProfileDataReturn` interface.

### File 4: `src/components/profile/header-actions/DesktopProfileActions.tsx` — certification check

Replace the string-match certification check with an actual query to `user_certifications`:

```ts
const [isCertified, setIsCertified] = useState(false);
useEffect(() => {
  if (!user?.id) return;
  supabase.from('user_certifications')
    .select('lansa_certified, verified')
    .eq('user_id', user.id)
    .single()
    .then(({ data }) => setIsCertified(!!data?.lansa_certified && !!data?.verified));
}, [user?.id]);
```

The "Appear to Employers" toggle only renders when `isCertified = true`.

---

## What the user will see after this fix

**In the hamburger menu on `/profile`:**

```
┌──────────────────────────────────────────────────┐
│  [Globe icon]  Shareable Profile Link             │
│                Off — your profile URL is private  │  [Switch]
└──────────────────────────────────────────────────┘

(Only shown if certified):
┌──────────────────────────────────────────────────┐
│  [Eye icon]    Appear to Employers                │
│                Off — not visible in employer feed │  [Switch]
└──────────────────────────────────────────────────┘
```

Each toggle has a clear title and a dynamic subtitle that tells the user exactly what the current state means. No more "Lansa Only" lock confusing non-certified users. The shareable link toggle is always available.

## What does NOT change
- `ListingActivationCard.tsx` — already works correctly, no changes
- `ProfileNotFound.tsx` — already works correctly, no changes
- `ProfileCard.tsx` — already works correctly, no changes
- `useSharedProfileData` — no changes
- DB schema — no changes
- All other flows — no changes
