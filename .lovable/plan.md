## Goal
Remove the legacy ("classic") job seeker UI everywhere it still exists, so every job seeker page renders only the new Portal v2 look. The recent changes (analytics card → SeekerSnapshotCard, Profile rail link, etc.) all targeted the new look — the old branches were still rendering for anyone who clicked "Use classic", which is why it looked unchanged.

## Scope
- Job seeker pages only. **Employer dashboard is NOT touched.**
- Mobile-specific layouts (e.g. `ContentLibrary` mobile branch) are kept — those are mobile design, not the old look.

## What's wired up today

`usePortalMode()` returns a `portalV2` boolean from `localStorage`. Every job seeker page has a `if (portalV2) { newLook } else { legacyLook }` branch. A floating `LegacyModeToggle` lets users swap. The branches exist in:

- `src/pages/Dashboard.tsx`
- `src/pages/Certification.tsx`
- `src/pages/Chat.tsx`
- `src/pages/ContentLibrary.tsx` (combined with `isMobile`)
- `src/pages/LearningJobFeed.tsx`
- `src/pages/Notifications.tsx`
- `src/pages/OpportunityDiscovery.tsx`
- `src/pages/Resources.tsx`
- `src/pages/ResumeEditor.tsx`
- `src/components/profile/ProfilePage.tsx`
- `src/components/profile/shared/SharedProfileContainer.tsx`
- `src/components/dashboard/portal/PortalPageShell.tsx` (renders the floating toggle)

## Changes

### 1. Drop the toggle infrastructure
- Delete `src/hooks/usePortalMode.ts`.
- Delete `src/components/dashboard/portal/LegacyModeToggle.tsx`.
- Remove the `showLegacyToggle` prop and the `<LegacyModeToggle />` render inside `PortalPageShell.tsx`.

### 2. Collapse every page to the new-look branch only
For each file in the list above:
- Remove `usePortalMode`/`LegacyModeToggle` imports.
- Delete the `else` branch (the legacy markup).
- For `ContentLibrary`, the condition becomes `if (isMobile)` instead of `if (isMobile || !portalV2)` — mobile path stays, desktop falls through to v2.
- For `Dashboard.tsx`, only the `<PortalShell …/>` branch remains; the `<DashboardTabs>` + `<ProfileCard>` legacy block is removed.

### 3. Delete the now-orphaned legacy components
After step 2, these files are unreferenced and get deleted:
- `src/components/dashboard/DashboardTabs.tsx`
- `src/components/dashboard/OverviewTab.tsx` (the root one — the new `overview/OverviewTab.tsx` is kept)
- `src/components/dashboard/AICoachTab.tsx`
- `src/components/dashboard/JobPreferencesTab.tsx`
- `src/components/dashboard/StoryBuilderTab.tsx`
- `src/components/dashboard/overview/ProfileCard.tsx` (only used by legacy Dashboard.tsx)

I'll grep each before deletion to confirm zero remaining imports — if anything still references them we keep the file and just trim the import.

### 4. Verification
- Type/build check passes.
- Manual: the floating "Use classic" pill is gone, `/dashboard`, `/profile`, `/chat`, `/notifications`, `/certification`, `/learning-jobs`, `/opportunities`, `/resources`, `/resume` all render the Portal v2 layout, including the `SeekerSnapshotCard` and Profile rail link from the previous edits.

## Notes
- No DB or edge function changes.
- `localStorage` key `lansa.dashboardPortalV2` is harmless leftover; not worth a cleanup migration.
- Employer pages, mobile-specific shells, and shared/public profile rendering stay as they are.