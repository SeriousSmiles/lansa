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
