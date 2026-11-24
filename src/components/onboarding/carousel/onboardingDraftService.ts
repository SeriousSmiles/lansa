import { supabase } from "@/integrations/supabase/client";
import { FLOW_VERSION, sanitizeDraft, type OnboardingIntent } from "./onboardingFlowModel";

export type DraftInputs = {
  flow_version?: number;
  user_intent?: OnboardingIntent;
  step?: string;
  company?: Record<string, string>;
  created_org_id?: string;
  join_org_id?: string;
  join_request_sent?: boolean;
  [k: string]: unknown;
};

export type AnswersRow = { user_type: string | null; career_path: string | null; onboarding_inputs: DraftInputs | null };

export async function loadAnswers(userId: string): Promise<AnswersRow | null> {
  const { data, error } = await supabase
    .from('user_answers')
    .select('user_type, career_path, onboarding_inputs')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AnswersRow) ?? null;
}

const userTypeFor = (i: OnboardingIntent) => (i === 'job_seeker' ? 'job_seeker' : i === 'mentor' ? 'mentor' : 'employer');

/** Merge a non-sensitive draft into user_answers.onboarding_inputs (user-scoped by RLS). */
export async function saveDraft(userId: string, current: DraftInputs | null, patch: DraftInputs, extra: Record<string, unknown> = {}): Promise<DraftInputs> {
  const next = sanitizeDraft({ ...(current || {}), ...patch, flow_version: FLOW_VERSION }) as DraftInputs;
  const row: Record<string, unknown> = { user_id: userId, onboarding_inputs: next, updated_at: new Date().toISOString(), ...extra };
  if (next.user_intent) row.user_type = userTypeFor(next.user_intent);
  const { error } = await supabase.from('user_answers').upsert(row as never, { onConflict: 'user_id' });
  if (error) throw error;
  return next;
}

/** Per-browser memory of the role picked on /signup, before an account exists. */
const SIGNUP_INTENT_KEY = 'lansa.signup.intent';
export function rememberSignupIntent(intent: 'job_seeker' | 'employer') {
  try { localStorage.setItem(SIGNUP_INTENT_KEY, intent); } catch { /* storage unavailable */ }
}
export function readSignupIntent(): 'job_seeker' | 'employer' | null {
  try {
    const v = localStorage.getItem(SIGNUP_INTENT_KEY);
    return v === 'job_seeker' || v === 'employer' ? v : null;
  } catch { return null; }
}
export function clearSignupIntent() {
  try { localStorage.removeItem(SIGNUP_INTENT_KEY); } catch { /* ignore */ }
}
