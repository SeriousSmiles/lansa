
## Candidate Listing Activation — Plan

### What's missing
There is **no UI** that lets a certified seeker toggle `visible_to_employers = true` in `user_profiles`. Without this being `true`, the `sync_user_profiles_public` trigger won't sync their row into the browse feed — so even certified users are invisible to employers unless `visible_to_employers` is set.

The `StudentAnalyticsCard` also checks `catalogue_entries.is_active` but the actual feed uses `user_profiles_public` which is driven by `visible_to_employers`. These are misaligned.

### What to build

#### 1. Listing Activation Toggle — new `ListingActivationCard` component
A clear card on the seeker dashboard (inside the Overview tab) that:
- Only shows for **certified** users (`lansa_certified = true AND verified = true`)
- Reads the current `visible_to_employers` value from `user_profiles`
- Shows status: **"You're Listed"** (active, green) or **"Activate Your Listing"** (inactive, CTA)
- Has a toggle/button to set `visible_to_employers = true/false`
- On activate: upserts `visible_to_employers = true` → triggers `sync_user_profiles_public` → candidate appears in employer browse feed
- On deactivate: sets `visible_to_employers = false` → removes from feed

#### 2. Fix `StudentAnalyticsCard` listing check
Replace `catalogue_entries.is_active` check with `user_profiles.visible_to_employers` to match the actual discovery mechanism.

#### 3. Re-enable `visible_to_employers` filter in `discoveryService`
Currently `discoveryService` only cross-references `user_certifications` for certified status. It does not verify `visible_to_employers`. This means a certified user with `visible_to_employers = false` who has a row in `user_profiles_public` from an old trigger run might still appear. Add an explicit filter: only show profiles where the underlying user has `visible_to_employers = true`.

The safest approach: add `.eq('visible_to_employers', true)` to the `user_profiles_public` query — but `user_profiles_public` doesn't have that column. Instead, after fetching from `user_profiles_public`, cross-reference `user_profiles` for `visible_to_employers = true` — OR rely on the trigger cleanup (when `visible_to_employers = false`, the trigger deletes the row from `user_profiles_public`). Since the trigger already handles this, the browse feed is safe — we just need the activation UI.

### Files to change

| File | Change |
|---|---|
| `src/components/dashboard/overview/ListingActivationCard.tsx` | **New** — toggle card for certified seekers |
| `src/components/dashboard/overview/OverviewTab.tsx` | Add `ListingActivationCard` below `GrowthCardSection`, only for seeker role |
| `src/components/dashboard/overview/StudentAnalyticsCard.tsx` | Fix listing check: read `user_profiles.visible_to_employers` instead of `catalogue_entries.is_active` |

### Card design
```
┌─────────────────────────────────────────────────┐
│  🟢 Your Profile is Live                        │
│  Employers can discover you in the browse feed. │
│                                                 │
│  [  Pause Listing  ]   Listed since: Jan 2026   │
└─────────────────────────────────────────────────┘

or when inactive:

┌─────────────────────────────────────────────────┐
│  ⚡ Activate Your Listing                        │
│  You're certified. Start appearing to employers │
│  who are actively searching for talent like you │
│                                                 │
│  [  Go Live Now  ]                              │
└─────────────────────────────────────────────────┘
```

The card is only visible to certified users (will check `user_certifications.lansa_certified AND verified = true`). Non-certified users continue to see the certification prompt pathway.

### Safety guarantee for existing browse feature
No changes to `discoveryService.ts` or `CandidateBrowseTab.tsx`. The browse feature is untouched. The `sync_user_profiles_public` trigger already removes profiles when `visible_to_employers` is set to `false`, so deactivating naturally removes candidates from the feed.
