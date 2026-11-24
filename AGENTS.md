# Security architecture

- Start certification sessions through `start_certification_exam`, not browser-selected question IDs; the intentionally authenticated SECURITY DEFINER RPC checks caller identity and sector payment, assigns a bounded question subset, and uses a fixed search path.
- Keep exam composition server-side (MCQ-only until written questions are enabled there); otherwise browser flags can bypass question access controls.
- Profile image uploads use `profile-images/<user-id>/<filename>`; storage policies bind uploads and listings to their owner while existing public media links remain available.
- Enable RLS on internal chat email history; SECURITY DEFINER system triggers run with the required privileges without granting browser access.

# Dashboard presentation

- Use the shared DashboardActionBand and EmployerWorkspace for overview hierarchy across account types and device sizes; keep data access and hiring actions in their existing owners to avoid divergent behavior.
- Keep dashboard contrast, tinted surfaces, and shadows in global semantic tokens and the dashboard CTA button variant so seeker and employer overviews share a theme-aware visual hierarchy.

# Resume editor

- Use one ResumeSnapshot for guided content edits, design, save/restore, preview, and export; do not expose the disconnected free-form canvas in this editor because it produces divergent output.
- Measure document blocks at physical paper size and render fixed-height paginated ResumeDocument sheets for both preview and printing; wait for fonts and images before signalling print readiness to prevent clipped exports.
- Keep page dimensions and bounded typography/margins in resumeDocumentModel with regression tests so personalization cannot change the physical paper or make body text unreadable.
# Mobile employer discovery
- Route mobile direct browse through the guarded employer dashboard and share MobileCandidateBrowser inside one safe-area shell; this keeps discovery, hiring tools, deep links and four fixed destinations consistent without duplicating candidate fetches.
- Keep mobile deck decisions gated through confirmed persistence and dismissal; target Undo by the returned pass ID and retain match presentation independently of the remaining deck to avoid duplicates, wrong restores and lost final-card matches.
- Offer only implemented skill filters in the mobile discovery sheet and opt into strict discovery errors on mobile; unsupported filters and failed reads must not masquerade as genuine empty results.
- Keep JobPostingWizard as the single owner of job creation; mobile completion callbacks only refresh results so one completed wizard cannot submit a second job.

# Employer environment
- Employer surfaces share the scoped .employer-theme tokens and .ee-* primitives (employerUi.tsx); restyle there rather than per screen so desktop and phone stay coordinated without changing the global theme.
- Phone employer navigation is five fixed tabs (Discover, Jobs, Inbox, Home, Company) driven by ?tab= with legacy aliases; /organization/settings?section= is the single owner of team settings on every device.
- Keep the job-applications sheet mounted while it closes; unmounting an open Radix sheet leaves the page unclickable.

# Seeker environment
- Seeker screens wrap in .seeker-theme (same tokens and .ee-* primitives as employers, seeker-only .sk-*); below lg they render native phone layouts (SeekerMobileHome, NativeProfileLayout) while desktop keeps PortalPageShell layouts.
- Seeker navigation is five fixed tabs (Home, Feed, Jobs, Inbox, Profile) shown below lg; seekerNavModel maps every seeker path to exactly one tab.
- The professional feed is member-authored only (career_posts, private career_post_bookmarks); validation lives in both careerFeedModel and the prepare_career_post trigger, which also snapshots only author name and title, so keep them in sync.

# Public home hero
- Home hero copy, name pairs and business marks live in homeHeroContent.ts with local assets only; swap a mark by editing one entry so the animated layout never changes.

# Onboarding
- /signup and /onboarding share the carousel primitives in src/components/onboarding/carousel; step order, resume, swipe and validation rules live in onboardingFlowModel (tested) so flows stay consistent.
- Onboarding drafts are non-sensitive, user-scoped `user_answers.onboarding_inputs` with flow_version 2; step values save straight to user_profiles/organizations, and an open v2 draft blocks the legacy career_path auto-complete.
- Finish only through markOnboardingComplete then refreshUserState; company creation reuses a recorded/owned org and join requests treat "already pending" as success, so retries never duplicate.
- Editing a vacancy goes only through JobEditForm + jobPostingService.saveJobEdits (update by id and organization, changed fields only, throws, never inserts); JobPostingWizard stays create-only because it flattens structured fields.
- Phone and desktop job lists both read job_listings_v2 by the active organization_id so edit/close controls only ever target the current company's jobs.

# Illustrations
- Painted people-first art lives in src/assets/illustrations (webp) and is used only through components/common/Illustration (Illustration, IllustratedEmpty, EmployerEmpty art prop) so empty states stay consistent.
