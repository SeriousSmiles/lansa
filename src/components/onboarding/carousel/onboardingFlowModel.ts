/**
 * Pure rules for the role-aware onboarding carousel.
 * No React or Supabase here so the rules stay unit-testable.
 */

export type OnboardingIntent = 'job_seeker' | 'create_org' | 'join_org' | 'mentor';
export type SignupIntent = 'job_seeker' | 'employer';

export const FLOW_VERSION = 2;

export const SEEKER_STEPS = ['intro', 'stage', 'identity', 'goal', 'skills', 'background', 'visibility', 'done'] as const;
export const CREATE_STEPS = ['intro', 'name', 'industry', 'location', 'about', 'review', 'logo', 'done'] as const;
export const JOIN_STEPS = ['intro', 'search', 'confirm', 'done'] as const;

export type SeekerStep = typeof SEEKER_STEPS[number];
export type CreateStep = typeof CREATE_STEPS[number];
export type JoinStep = typeof JOIN_STEPS[number];

export function stepsFor(intent: OnboardingIntent): readonly string[] {
  if (intent === 'job_seeker') return SEEKER_STEPS;
  if (intent === 'create_org') return CREATE_STEPS;
  if (intent === 'join_org') return JOIN_STEPS;
  return [];
}

/** Steps a user can be sent back to after the server-side write is done. */
const LOCKED_AFTER: Record<string, string> = { create_org: 'review', join_org: 'confirm' };

/** Resolve where a resumed draft should open; unknown steps fall back to the first one. */
export function resumeStep(intent: OnboardingIntent, saved: string | undefined, opts: { orgCreated?: boolean; requestSent?: boolean } = {}): string {
  const steps = stepsFor(intent);
  if (intent === 'create_org' && opts.orgCreated) {
    return saved === 'done' ? 'done' : 'logo';
  }
  if (intent === 'join_org' && opts.requestSent) return 'done';
  if (!saved || !steps.includes(saved)) return steps[0];
  // A draft can never resume past the irreversible step without its result.
  const lock = LOCKED_AFTER[intent];
  if (lock && steps.indexOf(saved) > steps.indexOf(lock)) return lock;
  // Never resume on the completion card for seekers; the last real step re-confirms.
  if (saved === 'done') return steps[steps.length - 2];
  return saved;
}

/** "Step x of y" counts only the real setup cards, not the intro or completion. */
export function progressFor(intent: OnboardingIntent, step: string): { index: number; total: number } {
  const steps = stepsFor(intent).filter((s) => s !== 'intro' && s !== 'done');
  const i = steps.indexOf(step);
  return { index: i < 0 ? (step === 'done' ? steps.length : 0) : i + 1, total: steps.length };
}

/** Only informational cards may be changed with a sideways swipe. */
export function isSwipeable(step: string): boolean {
  return step === 'intro';
}

/**
 * Legacy seekers who saved a career path before the multi-step flow existed
 * were auto-completed. A version-2 draft that is still open must not be.
 */
export function shouldAutoCompleteLegacy(inputs: Record<string, unknown> | null | undefined, careerPath: unknown): boolean {
  if (!careerPath) return false;
  if (!inputs) return true;
  if (inputs.flow_version === FLOW_VERSION) return false;
  return inputs.user_intent === 'job_seeker';
}

const SENSITIVE = /pass|token|code|otp|secret/i;

/** Drafts are stored on the account; strip anything credential-like. */
export function sanitizeDraft<T extends Record<string, unknown>>(draft: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(draft)) {
    if (SENSITIVE.test(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = sanitizeDraft(v as Record<string, unknown>);
    else out[k] = v;
  }
  return out as Partial<T>;
}

export function mapSignupIntent(value: unknown): SignupIntent | null {
  return value === 'job_seeker' || value === 'employer' ? value : null;
}

// ─── Validation ───────────────────────────────────────────────────────────

export type Errors = Record<string, string>;

export function validateSeekerIdentity(v: { firstName: string; lastName: string; title: string }): Errors {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = 'Add your first name';
  if (!v.lastName.trim()) e.lastName = 'Add your last name';
  if (!v.title.trim()) e.title = 'Add a headline employers will read';
  else if (v.title.trim().length > 80) e.title = 'Keep your headline under 80 characters';
  return e;
}

export function validateSkills(skills: string[]): Errors {
  if (skills.length === 0) return { skills: 'Choose at least one skill' };
  if (skills.length > 15) return { skills: 'Choose up to 15 skills' };
  return {};
}

export function validateCompanyName(name: string): Errors {
  const n = name.trim();
  if (!n) return { name: 'Add your company name' };
  if (n.length < 2) return { name: 'Company name is too short' };
  if (n.length > 100) return { name: 'Company name is too long' };
  return {};
}

export function validateWebsite(url: string): Errors {
  if (!url.trim()) return {};
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    return {};
  } catch {
    return { website: 'Use a full web address, like https://yourcompany.com' };
  }
}

export function addSkill(skills: string[], raw: string): string[] {
  const s = raw.trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!s) return skills;
  if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) return skills;
  if (skills.length >= 15) return skills;
  return [...skills, s];
}
