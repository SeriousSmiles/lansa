import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, Building2, MailCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { CarouselFrame } from "@/components/onboarding/carousel/CarouselFrame";
import { MiniProfileCard, MiniCompanyCard } from "@/components/onboarding/carousel/Previews";
import { readSignupIntent, rememberSignupIntent } from "@/components/onboarding/carousel/onboardingDraftService";
import { mapSignupIntent, type SignupIntent } from "@/components/onboarding/carousel/onboardingFlowModel";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import heroImg from "@/assets/landing/people/p1-couch-phone.jpg";

type Stage = 'role' | 'account' | 'verify';

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [intent, setIntent] = useState<SignupIntent | null>(() => mapSignupIntent(params.get('role')) || readSignupIntent());
  const [stage, setStage] = useState<Stage>('role');
  const [dir, setDir] = useState<1 | -1>(1);
  const [email, setEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // Already signed in (or auto-confirmed): continue into setup.
  useEffect(() => { if (user) navigate('/onboarding', { replace: true }); }, [user, navigate]);

  const resend = async () => {
    if (!email || resendState === 'sending') return;
    setResendState('sending'); setResendMsg(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/onboarding` } });
    if (error) { setResendState('error'); setResendMsg(error.message || 'We couldn’t resend the email. Try again in a minute.'); }
    else { setResendState('sent'); setResendMsg('Sent. It can take a minute to arrive; check spam too.'); }
  };

  const seo = <SEOHead title="Create a Free Account | Lansa Curaçao" description="Sign up free to build your CV, get certified and apply to jobs in Curaçao. Employers can join to hire verified local talent." canonical="https://lansa.online/signup" />;

  if (stage === 'verify') {
    return (<>{seo}
      <CarouselFrame stepKey="verify" direction={1} progress={{ index: 3, total: 3 }} title="Check your email"
        lead={`We sent a confirmation link to ${email}. Open it on any device to continue; if it opens somewhere else, just sign in there and you’ll pick up where you left off.`}
        onBack={() => { setDir(-1); setStage('account'); }} error={resendState === 'error' ? resendMsg : null}>
        <div className="ob-verify"><MailCheck className="h-10 w-10" aria-hidden /></div>
        <button type="button" className="ob-alt" onClick={resend} disabled={resendState === 'sending'}>{resendState === 'sending' ? 'Sending…' : 'Resend the email'}</button>
        {resendState === 'sent' && <p className="ob-hint" role="status">{resendMsg}</p>}
        <button type="button" className="ob-alt" onClick={() => navigate('/login')}>I’ve confirmed — sign in</button>
      </CarouselFrame></>);
  }

  if (stage === 'account') {
    return (<>{seo}
      <CarouselFrame stepKey="account" direction={dir} progress={{ index: 2, total: 3 }} title="Create your account"
        lead={intent === 'employer' ? 'Use your work email so your team can find you.' : 'Use an email you check. Employers never see it.'}
        onBack={() => { setDir(-1); setStage('role'); }}>
        <SignUpForm intent={intent} onSubmitted={(e, signedIn) => { if (signedIn) navigate('/onboarding', { replace: true }); else { setEmail(e); setDir(1); setStage('verify'); } }} />
        <button type="button" className="ob-alt" onClick={() => navigate('/login')} data-testid="toggle-auth-mode">Already have an account? Sign in</button>
      </CarouselFrame></>);
  }

  const preview = intent === 'employer'
    ? <MiniCompanyCard name="Your company" industry="Hospitality" location="Willemstad, Curaçao" status="Browse certified candidates" />
    : intent === 'job_seeker' ? <MiniProfileCard name="Your name" title="Your headline" skills={['Customer service', 'English']} visible /> : null;

  return (<>{seo}
    <CarouselFrame stepKey="role" direction={dir} progress={{ index: 1, total: 3 }} media={intent ? undefined : heroImg} eyebrow="Join LANSA, free"
      title="How will you use LANSA?" lead="You can still change this during setup." aside={preview}
      nextDisabled={!intent} onNext={() => { if (intent) { rememberSignupIntent(intent); setDir(1); setStage('account'); } }}>
      <div className="ob-choices" role="radiogroup" aria-label="How will you use LANSA">
        {([
          { v: 'job_seeker', label: 'Find work', detail: 'A professional card that verified employers can discover', icon: <Briefcase className="h-5 w-5" /> },
          { v: 'employer', label: 'Hire talent', detail: 'Meet certified local candidates and post jobs', icon: <Building2 className="h-5 w-5" /> },
        ] as const).map((o) => (
          <button key={o.v} type="button" role="radio" aria-checked={intent === o.v} className={`ob-choice${intent === o.v ? ' is-on' : ''}`} onClick={() => setIntent(o.v)}>
            <span className="ob-choice-icon">{o.icon}</span>
            <span className="ob-choice-text"><strong>{o.label}</strong><small>{o.detail}</small></span>
            <span className="ob-radio" aria-hidden />
          </button>
        ))}
      </div>
      <button type="button" className="ob-alt" onClick={() => navigate('/login')}>Already have an account? Sign in</button>
    </CarouselFrame></>);
}
