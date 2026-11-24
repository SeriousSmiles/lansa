# Dashboard alignment

## Resume editor reality check
- [x] Replace disconnected/free-form controls with guided content and design edits using one document state.
- [x] Keep A4 and US Letter dimensions fixed, paginate overflow, and use the same pages for preview and PDF export.
- [x] Connect save/restore and undo/redo; validate isolated editing, section visibility, templates, paper sizes, and printed output.
- [ ] Verify saved edits read back through the signed-in editor and the hosted export service. Blocker: external unmanaged Supabase has no available authenticated test session.
Validation: six model tests and changed-file lint pass; preview builds are clean. Browser checks passed A4/Letter dimensions and content edits with no runtime errors. A three-page printed Letter PDF retained the last entry; all printed pages were visually reviewed. Corrected repeated section headings and the mismatched color-picker swatches during review. Hosted Word/PDF-A exports remain dependent on the existing external rendering worker.

- [x] Strengthen contrast and visual finishing on seeker and employer dashboards without changing workflows.
- [x] Validate the refreshed surfaces at desktop and mobile sizes.
Visual refinement validation: isolated overview surfaces passed layout and control checks at 1280px and 390px with no runtime errors or horizontal overflow. Full signed-in checks remain unavailable for external unmanaged Supabase.

- [x] Align seeker overview around one next action, opportunities, progress, and messages.
- [x] Align employer desktop and mobile with the same hierarchy and controls.
- [x] Check layouts, navigation, and available validation; commit changes.
Validation: changed overview files pass lint; shared employer layout checked at desktop and mobile sizes with no overflow. Authenticated end-to-end checks unavailable for external unmanaged Supabase. Chat delivery/notification behavior is unchanged.

## Native mobile employer discovery
- [x] Unify mobile landing/direct browse, stable four-destination navigation and existing hiring tools.
- [x] Build portrait discovery, grouped profile/filter sheets and persistent actionable matches.
- [x] Verify single decisions, refused-write recovery, exact one-time Undo and responsive presentation without real candidate writes.

Discovery validation: eight focused tests pass; preview build OK; local fixture checks at 320×568, 375×667, 390×844 and 430×932 pass. Checked details, skills filters, retry, refused writes, Undo including the final card, drag feedback, reduced motion, last-card matches, chat destination, applications deep links, pending organization guard, gated settings and fixed navigation. Desktop 1280×1800 smoke check passes with local-only providers. Real-account sessions, live RLS writes and message delivery were deliberately not exercised; no production rows changed and nothing published. Before/after captures and test scripts remain outside source.

## Employer environment redesign
- [x] Peach/ink employer theme across employer routes; five-tab phone shell with Company tab.
- [x] Home metrics and vacancies needing attention, Jobs by status with detail sheet, applicant filters and permission-aware decisions, Analytics, native Company and /organization/settings, employer inbox/thread styling.
- [x] Local-fixture checks at 320, 390, 768 and 1280; owner vs view-only roles; no real writes.
- [ ] Mobile job editing. Blocker: the existing edit flow creates a new posting instead of updating; needs an update path in JobPostingWizard first.

## Seeker environment (stage 2)
- [x] Seeker theme and five-tab navigation across /dashboard, /feed, /jobs, /discovery, /chat, /notifications, /profile, resume, card, certification, resources, content.
- [x] Professional feed with categories, Saved, post detail, compose with https link check, owner-only delete (new member-only tables).
- [x] Phone profile builder: Edit/Preview, next missing section opens its editor, proof of work, visibility & sharing, CV import, resume and card.
- [x] Jobs: labeled Pass / Details / Save, Saved & applied tab and ?tab=saved / ?job= links.
- [x] Onboarding redesign (stage 3).

## Stage 3 — Onboarding carousel (done, preview only)
- [x] Role-aware /signup (role → account → check email/resend) and /onboarding carousel for seeker, create company, join company; mentor path kept
- [x] Safe job editing on phone and desktop (update-only, current company)

## App-wide redesign
- [x] Painted illustrations + shared empty states (feed, jobs, applicants, inbox, notifications)
- [x] Warm canvas tokens, sidebar, page headers, sign-in/reset, 404, not-allowed
- [ ] Seeker split views (Mercor-style jobs), employer table/drawer views, settings layouts, pricing/help, mentor

## Role-correct activity sweep
- [x] Exclude seeker-only alerts and self-match metadata from employer Home, shared history, unread lists/counts and recent activity without changing historical records.
- [x] Gate future swipe notifications, seeker interest review and email delivery by actual sender/recipient roles; preserve match and connection events.
- [x] Validate shared read paths and future-alert/email gates with isolated data; confirm applied functions and commit. Live accounts, real emails and a full seeker-review connection were not exercised.
