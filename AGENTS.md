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