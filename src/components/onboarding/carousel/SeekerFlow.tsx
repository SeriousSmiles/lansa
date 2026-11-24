import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, Search, X, FileUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CVUploadModal } from "@/components/onboarding/cv/CVUploadModal";
import { Switch } from "@/components/ui/switch";
import { CarouselFrame, Field, ChoiceList } from "./CarouselFrame";
import { MiniProfileCard } from "./Previews";
import { saveDraft, type DraftInputs } from "./onboardingDraftService";
import { SEEKER_STEPS, progressFor, resumeStep, validateSeekerIdentity, validateSkills, addSkill, type Errors } from "./onboardingFlowModel";
import introImg from "@/assets/landing/people/p7-blazer-laptop.jpg";
import doneImg from "@/assets/landing/people/p3-desk-certificate.jpg";

const SUGGESTED_SKILLS = ['Customer service', 'Communication', 'Teamwork', 'Microsoft Excel', 'Sales', 'Social media', 'Bookkeeping', 'Papiamentu', 'English', 'Dutch', 'Spanish', 'Problem solving', 'Hospitality', 'Data entry', 'Project management', 'Graphic design', 'Cash handling', 'Leadership'];

type Profile = {
  first_name: string; last_name: string; title: string; location: string; professional_goal: string; about_text: string;
  skills: string[]; experiences: any[]; education: any[]; visible_to_employers: boolean; is_public: boolean;
  professional_stage: string; profile_image: string | null;
};

const EMPTY: Profile = { first_name: '', last_name: '', title: '', location: '', professional_goal: '', about_text: '', skills: [], experiences: [], education: [], visible_to_employers: false, is_public: false, professional_stage: '', profile_image: null };

type Props = {
  userId: string;
  draft: DraftInputs | null;
  setDraft: (d: DraftInputs) => void;
  onChangeRole: () => void;
  onFinish: (name: { first: string; last: string }) => Promise<void>;
};

export function SeekerFlow({ userId, draft, setDraft, onChangeRole, onFinish }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<string>(() => resumeStep('job_seeker', draft?.step));
  const [dir, setDir] = useState<1 | -1>(1);
  const [p, setP] = useState<Profile>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [bgKind, setBgKind] = useState<'experience' | 'education'>('experience');
  const [bg, setBg] = useState({ title: '', description: '', startYear: '' });
  const [cvOpen, setCvOpen] = useState(false);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, title, location, professional_goal, about_text, skills, experiences, education, visible_to_employers, is_public, professional_stage, profile_image')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) { setSaveError('We could not load your profile. Check your connection and try again.'); return; }
    const d: any = data || {};
    let first = d.first_name || '', last = d.last_name || '';
    if (!first && !last) {
      const { data: u } = await supabase.auth.getUser();
      first = u.user?.user_metadata?.first_name || '';
      last = u.user?.user_metadata?.last_name || '';
    }
    setP({
      ...EMPTY, ...Object.fromEntries(Object.entries(d).filter(([, v]) => v !== null)),
      first_name: first, last_name: last,
      skills: Array.isArray(d.skills) ? d.skills : [],
      experiences: Array.isArray(d.experiences) ? d.experiences : [],
      education: Array.isArray(d.education) ? d.education : [],
      visible_to_employers: !!d.visible_to_employers, is_public: !!d.is_public,
    } as Profile);
    setLoaded(true);
  };
  useEffect(() => { loadProfile(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);

  const go = async (to: string, fields?: Partial<Profile>, d: 1 | -1 = 1, extra: Record<string, unknown> = {}) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setSaveError(null);
    try {
      if (fields && Object.keys(fields).length) {
        const { error } = await supabase.from('user_profiles').upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() } as never, { onConflict: 'user_id' });
        if (error) throw error;
      }
      const next = await saveDraft(userId, draft, { user_intent: 'job_seeker', step: to }, extra);
      setDraft(next);
      setErrors({}); setDir(d); setStep(to);
    } catch {
      setSaveError('That didn’t save. Your answers are still here, so try again.');
    } finally {
      lock.current = false; setBusy(false);
    }
  };
  const back = (to: string) => { setErrors({}); setSaveError(null); setDir(-1); setStep(to); saveDraft(userId, draft, { user_intent: 'job_seeker', step: to }).then(setDraft).catch(() => {}); };
  const prevOf = (s: string) => SEEKER_STEPS[Math.max(0, SEEKER_STEPS.indexOf(s as any) - 1)];

  const fullName = `${p.first_name} ${p.last_name}`.trim();
  const bgLines = [...p.experiences, ...p.education].map((x: any) => x?.title).filter(Boolean);
  const preview = <MiniProfileCard name={fullName} title={p.title} location={p.location} goal={p.professional_goal} skills={p.skills} photo={p.profile_image} visible={step === 'visibility' || step === 'done' ? p.visible_to_employers : undefined} background={bgLines} />;
  const prog = progressFor('job_seeker', step);
  const common = { stepKey: step, direction: dir, progress: prog, busy, error: saveError };

  if (!loaded) {
    return <CarouselFrame {...common} title="Loading your profile" error={saveError} onNext={saveError ? () => { setSaveError(null); loadProfile(); } : undefined} nextLabel="Try again" />;
  }

  switch (step) {
    case 'intro':
      return (
        <CarouselFrame {...common} media={introImg} eyebrow="Your professional card" title="Employers see a card, not a CV pile"
          lead="Your name, headline, skills and background become one card. It only appears to verified employers when you switch it on, and you can hide it any time."
          onBack={onChangeRole} onNext={() => go('stage')} nextLabel="Build my card" swipeable />
      );
    case 'stage':
      return (
        <CarouselFrame {...common} aside={preview} title="Where are you right now?" lead="This tailors the jobs and learning you see first."
          onBack={() => back('intro')} nextDisabled={!p.professional_stage}
          onNext={() => go('identity', { professional_stage: p.professional_stage }, 1, { career_path: 'student' })}>
          <ChoiceList name="Career stage" value={(p.professional_stage || null) as any} onChange={(v) => setP({ ...p, professional_stage: v })}
            options={[
              { value: 'student', label: 'Still studying', detail: 'Internships, first jobs and part-time work', icon: <GraduationCap className="h-5 w-5" /> },
              { value: 'working_professional', label: 'Working professional', detail: 'Your next role or a step up', icon: <Briefcase className="h-5 w-5" /> },
            ]} />
        </CarouselFrame>
      );
    case 'identity': {
      const submit = () => {
        const e = validateSeekerIdentity({ firstName: p.first_name, lastName: p.last_name, title: p.title });
        setErrors(e); if (Object.keys(e).length) return;
        go('goal', { first_name: p.first_name.trim(), last_name: p.last_name.trim(), name: fullName, title: p.title.trim(), location: p.location.trim() || null } as any);
      };
      return (
        <CarouselFrame {...common} aside={preview} title="Who should employers meet?" lead="Your headline is the first line under your name." onBack={() => back('stage')} onNext={submit}>
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
            <div className="ob-row2">
              <Field id="ob-first" label="First name" error={errors.firstName}><input id="ob-first" className="ob-input" autoComplete="given-name" value={p.first_name} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'ob-first-err' : undefined} onChange={(e) => setP({ ...p, first_name: e.target.value })} /></Field>
              <Field id="ob-last" label="Last name" error={errors.lastName}><input id="ob-last" className="ob-input" autoComplete="family-name" value={p.last_name} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'ob-last-err' : undefined} onChange={(e) => setP({ ...p, last_name: e.target.value })} /></Field>
            </div>
            <Field id="ob-title" label="Headline" error={errors.title} hint="For example: Hospitality student · Front desk"><input id="ob-title" className="ob-input" maxLength={80} value={p.title} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'ob-title-err' : undefined} onChange={(e) => setP({ ...p, title: e.target.value })} /></Field>
            <Field id="ob-loc" label="Location (optional)"><input id="ob-loc" className="ob-input" autoComplete="address-level2" placeholder="Willemstad, Curaçao" value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} /></Field>
            <button type="submit" hidden />
          </form>
        </CarouselFrame>
      );
    }
    case 'goal':
      return (
        <CarouselFrame {...common} aside={preview} title="What are you working toward?" lead="One or two sentences. Employers read this on your card."
          onBack={() => back('identity')} onSkip={() => go('skills')} skipLabel="Skip"
          nextDisabled={!p.professional_goal.trim()} onNext={() => go('skills', { professional_goal: p.professional_goal.trim().slice(0, 280) })}>
          <Field id="ob-goal" label="Your goal" hint={`${p.professional_goal.length}/280`}>
            <textarea id="ob-goal" className="ob-input ob-textarea" maxLength={280} rows={4} placeholder="I want to grow into a team lead role in hospitality." value={p.professional_goal} onChange={(e) => setP({ ...p, professional_goal: e.target.value })} />
          </Field>
        </CarouselFrame>
      );
    case 'skills': {
      const q = skillQuery.trim().toLowerCase();
      const matches = SUGGESTED_SKILLS.filter((s) => !p.skills.includes(s) && (!q || s.toLowerCase().includes(q)));
      const canAddCustom = q && !SUGGESTED_SKILLS.some((s) => s.toLowerCase() === q) && !p.skills.some((s) => s.toLowerCase() === q);
      const submit = () => { const e = validateSkills(p.skills); setErrors(e); if (Object.keys(e).length) return; go('background', { skills: p.skills }); };
      return (
        <CarouselFrame {...common} aside={preview} title="What are you good at?" lead="Pick or type up to 15 skills." onBack={() => back('goal')} onNext={submit}>
          {p.skills.length > 0 && (
            <div className="ob-selected" aria-label="Selected skills">
              {p.skills.map((s) => (
                <button key={s} type="button" className="ob-chip is-on" onClick={() => setP({ ...p, skills: p.skills.filter((x) => x !== s) })} aria-label={`Remove ${s}`}>{s}<X className="h-3.5 w-3.5" /></button>
              ))}
            </div>
          )}
          <div className="ob-search">
            <Search className="h-4 w-4" aria-hidden />
            <input aria-label="Search skills" className="ob-search-input" placeholder="Search or add a skill" value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (skillQuery.trim()) { setP({ ...p, skills: addSkill(p.skills, skillQuery) }); setSkillQuery(''); } } }} />
          </div>
          {errors.skills && <p className="ob-field-err" role="alert">{errors.skills}</p>}
          <div className="ob-chips">
            {canAddCustom && <button type="button" className="ob-chip is-add" onClick={() => { setP({ ...p, skills: addSkill(p.skills, skillQuery) }); setSkillQuery(''); }}><Plus className="h-3.5 w-3.5" />Add “{skillQuery.trim()}”</button>}
            {matches.map((s) => <button key={s} type="button" className="ob-chip" onClick={() => setP({ ...p, skills: addSkill(p.skills, s) })}>{s}</button>)}
          </div>
        </CarouselFrame>
      );
    }
    case 'background': {
      const has = bg.title.trim().length > 0;
      const year = parseInt(bg.startYear, 10);
      const add = () => {
        const e: Errors = {};
        if (!bg.title.trim()) e.bgTitle = bgKind === 'experience' ? 'Add a role and employer' : 'Add a school or course';
        if (bg.startYear && (isNaN(year) || year < 1950 || year > new Date().getFullYear())) e.bgYear = 'Use a four-digit year';
        setErrors(e); if (Object.keys(e).length) return;
        const item = { id: crypto.randomUUID(), title: bg.title.trim(), description: bg.description.trim(), startYear: isNaN(year) ? undefined : year, endYear: null };
        const fields = bgKind === 'experience' ? { experiences: [...p.experiences, item] } : { education: [...p.education, item] };
        setP({ ...p, ...fields });
        setBg({ title: '', description: '', startYear: '' });
        go('visibility', fields);
      };
      return (
        <CarouselFrame {...common} aside={preview} title="Add one thing you’ve done" lead="A job, internship or study. Import a CV instead, or add more later from your profile."
          onBack={() => back('skills')} onSkip={() => go('visibility')} skipLabel={bgLines.length ? 'Continue' : 'Skip'}
          nextLabel="Save and continue" nextDisabled={!has} onNext={add}>
          {bgLines.length > 0 && <p className="ob-hint">Already on your profile: {bgLines.slice(0, 3).join(', ')}</p>}
          <div className="ob-seg" role="tablist" aria-label="Type">
            <button type="button" role="tab" aria-selected={bgKind === 'experience'} onClick={() => setBgKind('experience')}>Experience</button>
            <button type="button" role="tab" aria-selected={bgKind === 'education'} onClick={() => setBgKind('education')}>Education</button>
          </div>
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); add(); }} noValidate>
            <Field id="ob-bg-title" label={bgKind === 'experience' ? 'Role and employer' : 'School or course'} error={errors.bgTitle}>
              <input id="ob-bg-title" className="ob-input" placeholder={bgKind === 'experience' ? 'Front desk agent, Hotel Kura' : 'University of Curaçao, BBA'} value={bg.title} onChange={(e) => setBg({ ...bg, title: e.target.value })} aria-invalid={!!errors.bgTitle} />
            </Field>
            <Field id="ob-bg-year" label="Start year (optional)" error={errors.bgYear}>
              <input id="ob-bg-year" className="ob-input" inputMode="numeric" maxLength={4} value={bg.startYear} onChange={(e) => setBg({ ...bg, startYear: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <Field id="ob-bg-desc" label="What you did (optional)">
              <textarea id="ob-bg-desc" className="ob-input ob-textarea" rows={2} maxLength={300} value={bg.description} onChange={(e) => setBg({ ...bg, description: e.target.value })} />
            </Field>
            <button type="submit" hidden />
          </form>
          <button type="button" className="ob-alt" onClick={() => setCvOpen(true)}><FileUp className="h-4 w-4" />Import from my CV instead</button>
          <CVUploadModal open={cvOpen} onOpenChange={setCvOpen} onComplete={() => { setCvOpen(false); loadProfile(); }} />
        </CarouselFrame>
      );
    }
    case 'visibility':
      return (
        <CarouselFrame {...common} aside={preview} title="Who can see your card?" lead="Both are off until you choose. You can change them later in your profile."
          onBack={() => back('background')} nextLabel="Finish my card"
          onNext={async () => {
            if (lock.current) return;
            await go('done', { visible_to_employers: p.visible_to_employers, is_public: p.is_public });
          }}>
          <div className="ee-group">
            <label className="ee-row ob-toggle">
              <span className="ee-row-text"><span className="ee-row-label">Show me to employers</span><span className="ee-row-detail">Verified LANSA employers can find your card. Contact details stay private.</span></span>
              <Switch checked={p.visible_to_employers} onCheckedChange={(v) => setP({ ...p, visible_to_employers: v })} aria-label="Show me to employers" />
            </label>
            <label className="ee-row ob-toggle">
              <span className="ee-row-text"><span className="ee-row-label">Shareable link</span><span className="ee-row-detail">Anyone with your link can view your profile.</span></span>
              <Switch checked={p.is_public} onCheckedChange={(v) => setP({ ...p, is_public: v })} aria-label="Shareable link" />
            </label>
          </div>
        </CarouselFrame>
      );
    case 'done':
    default:
      return (
        <DoneCard
          media={doneImg} preview={preview}
          title={`Nice work${p.first_name ? `, ${p.first_name}` : ''}. Your card is ready.`}
          lead={p.visible_to_employers ? 'Employers can now find you. Next, add your strongest proof of work.' : 'Your card is private for now. Open your profile to finish it, then switch on visibility when you’re ready.'}
          actionLabel="Open my profile"
          onAction={async () => { await onFinish({ first: p.first_name.trim(), last: p.last_name.trim() }); navigate('/profile', { replace: true, state: { fromOnboarding: true } }); }}
          onBack={() => back('visibility')}
        />
      );
  }
}

export function DoneCard({ media, preview, title, lead, actionLabel, onAction, onBack }: { media: string; preview: React.ReactNode; title: string; lead: string; actionLabel: string; onAction: () => Promise<void>; onBack?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const lock = useRef(false);
  return (
    <CarouselFrame stepKey="done" direction={1} media={media} title={title} lead={lead} aside={preview} onBack={onBack} busy={busy} error={err} nextLabel={actionLabel}
      onNext={async () => {
        if (lock.current) return; lock.current = true; setBusy(true); setErr(null);
        try { await onAction(); } catch { setErr('We couldn’t finish setup. Check your connection and try again.'); lock.current = false; setBusy(false); }
      }} />
  );
}
