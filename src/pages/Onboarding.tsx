import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useUnifiedAuth, useUserState } from "@/contexts/UnifiedAuthProvider";
import { MentorOnboarding } from "@/components/mentor/MentorOnboarding";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";
import { LansaLoader } from "@/components/shared/LansaLoader";
import { SEOHead } from "@/components/SEOHead";
import { RoleChoice } from "@/components/onboarding/carousel/RoleChoice";
import { SeekerFlow } from "@/components/onboarding/carousel/SeekerFlow";
import { CreateCompanyFlow, JoinCompanyFlow } from "@/components/onboarding/carousel/EmployerFlows";
import { CarouselFrame } from "@/components/onboarding/carousel/CarouselFrame";
import { loadAnswers, saveDraft, readSignupIntent, clearSignupIntent, type DraftInputs } from "@/components/onboarding/carousel/onboardingDraftService";
import { FLOW_VERSION, shouldAutoCompleteLegacy, type OnboardingIntent } from "@/components/onboarding/carousel/onboardingFlowModel";
import { getRoleHomePath } from "@/utils/roleRoutes";

const INVITE_KEY = 'lansa.invite_token';

export default function Onboarding() {
  const { user } = useAuth();
  const { refreshUserState, hasCompletedOnboarding } = useUserState();
  const { userType, isAdmin } = useUnifiedAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftInputs | null>(null);
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const finishing = useRef(false);
  const [attempt, setAttempt] = useState(0);

  const inviteToken = (() => {
    const t = params.get('invite_token');
    try {
      if (t) sessionStorage.setItem(INVITE_KEY, t);
      return t || sessionStorage.getItem(INVITE_KEY);
    } catch { return t; }
  })();

  // Completed members go straight home; this page never forces a repeat.
  useEffect(() => {
    if (!loading && hasCompletedOnboarding && !finishing.current && !inviteToken) {
      navigate(getRoleHomePath({ userType: userType as any, isAdmin, fallback: '/dashboard' }), { replace: true });
    }
  }, [loading, hasCompletedOnboarding, inviteToken, userType, isAdmin, navigate]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true); setLoadError(null);
      try {
        const row = await loadAnswers(user.id);
        if (!alive) return;
        const inputs = row?.onboarding_inputs || null;
        // Legacy seekers stuck after choosing a career path complete as before;
        // an open multi-step draft never does.
        if (!hasCompletedOnboarding && row?.user_type === 'job_seeker' && shouldAutoCompleteLegacy(inputs, row?.career_path)) {
          finishing.current = true;
          const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
          await markOnboardingComplete(user.id, 'job_seeker');
          await refreshUserState?.();
          navigate('/profile', { replace: true, state: { fromOnboarding: true } });
          return;
        }
        setDraft(inputs);
        if (inviteToken) setIntent('join_org');
        else if (inputs?.user_intent) setIntent(inputs.user_intent as OnboardingIntent);
      } catch {
        if (alive) setLoadError('We couldn’t load your setup. Check your connection and try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, attempt]);

  const choose = async (i: OnboardingIntent) => {
    if (!user?.id || choosing) return;
    setChoosing(true); setChoiceError(null);
    try {
      // Starting a role resets the step but keeps any typed company details.
      const next = await saveDraft(user.id, draft, { user_intent: i, step: undefined, flow_version: FLOW_VERSION });
      setDraft(next); setIntent(i);
    } catch {
      setChoiceError('That didn’t save. Try again.');
    } finally { setChoosing(false); }
  };

  const finish = (type: 'job_seeker' | 'employer') => async (names?: { first: string; last: string }) => {
    if (!user?.id) throw new Error('Not signed in');
    finishing.current = true;
    try {
      const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
      await markOnboardingComplete(user.id, type, names);
      clearSignupIntent();
      await refreshUserState?.();
    } catch (e) { finishing.current = false; throw e; }
  };

  if (loading) return <LansaLoader duration={5000} />;

  if (loadError) {
    return <CarouselFrame stepKey="err" direction={1} title="Setup didn’t load" lead={loadError} onNext={() => setAttempt((a) => a + 1)} nextLabel="Try again" />;
  }

  if (!user?.id) return null;

  const changeRole = () => { setIntent(null); };
  const flowProps = { userId: user.id, draft, setDraft, onChangeRole: changeRole };

  let body: JSX.Element;
  if (!intent) {
    const meta = (user as any)?.user_metadata?.signup_intent;
    const hint = readSignupIntent() || (meta === "job_seeker" || meta === "employer" ? meta : null);
    body = <RoleChoice initial={hint === 'job_seeker' ? 'job_seeker' : null} employerHint={hint === 'employer'} busy={choosing} error={choiceError} onSelect={choose} />;
  } else if (intent === 'job_seeker') {
    body = <SeekerFlow {...flowProps} onFinish={finish('job_seeker')} />;
  } else if (intent === 'create_org') {
    body = <CreateCompanyFlow {...flowProps} onFinish={() => finish('employer')()} />;
  } else if (intent === 'join_org') {
    body = <JoinCompanyFlow {...flowProps} inviteToken={inviteToken} onFinish={() => finish('employer')()} />;
  } else {
    body = (
      <div className="min-h-screen bg-background">
        <MentorOnboarding onComplete={async () => { finishing.current = true; await refreshUserState?.(); navigate('/mentor-dashboard', { replace: true }); }} />
      </div>
    );
  }

  return (
    <OnboardingErrorBoundary>
      <SEOHead title="Set up your LANSA account" description="Set up your LANSA profile or company in a few short steps." canonical="https://lansa.online/onboarding" noindex />
      {body}
    </OnboardingErrorBoundary>
  );
}
