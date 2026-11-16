# Security architecture

- Start certification sessions through `start_certification_exam`, not browser-selected question IDs; the intentionally authenticated SECURITY DEFINER RPC checks caller identity and sector payment, assigns a bounded question subset, and uses a fixed search path.
- Keep exam composition server-side (MCQ-only until written questions are enabled there); otherwise browser flags can bypass question access controls.
- Profile image uploads use `profile-images/<user-id>/<filename>`; storage policies bind uploads and listings to their owner while existing public media links remain available.
- Enable RLS on internal chat email history; SECURITY DEFINER system triggers run with the required privileges without granting browser access.

# Dashboard presentation

- Use the shared DashboardActionBand and EmployerWorkspace for overview hierarchy across account types and device sizes; keep data access and hiring actions in their existing owners to avoid divergent behavior.