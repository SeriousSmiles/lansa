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
