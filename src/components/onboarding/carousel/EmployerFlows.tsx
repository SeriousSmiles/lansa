import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Upload, Check, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Organization } from "@/types/organization";
import { CarouselFrame, Field } from "./CarouselFrame";
import { MiniCompanyCard } from "./Previews";
import { DoneCard } from "./SeekerFlow";
import { saveDraft, type DraftInputs } from "./onboardingDraftService";
import { progressFor, resumeStep, validateCompanyName, validateWebsite, type Errors } from "./onboardingFlowModel";
import introImg from "@/assets/landing/people/p4-videocall.jpg";
import doneImg from "@/assets/landing/people/p2-cafe-laptop.jpg";

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Hospitality', 'Real Estate', 'Marketing', 'Other'];
const SIZES = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'];

type FlowProps = {
  userId: string;
  draft: DraftInputs | null;
  setDraft: (d: DraftInputs) => void;
  onChangeRole: () => void;
  onFinish: () => Promise<void>;
};

const SAVE_ERR = 'That didn’t save. Your answers are still here, so try again.';

export function CreateCompanyFlow({ userId, draft, setDraft, onChangeRole, onFinish }: FlowProps) {
  const navigate = useNavigate();
  const { refreshOrganization } = useOrganization();
  const orgId = draft?.created_org_id;
  const [step, setStep] = useState(() => resumeStep('create_org', draft?.step, { orgCreated: !!orgId }));
  const [dir, setDir] = useState<1 | -1>(1);
  const [c, setC] = useState<Record<string, string>>({ name: '', industry: '', size_range: '', country: 'Curaçao', city: '', description: '', website: '', ...(draft?.company || {}) });
  const [errors, setErrors] = useState<Errors>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dup, setDup] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const lock = useRef(false);

  const go = async (to: string, d: 1 | -1 = 1, patch: DraftInputs = {}) => {
    if (lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try {
      const next = await saveDraft(userId, draft, { user_intent: 'create_org', step: to, company: c, ...patch });
      setDraft(next); setErrors({}); setDir(d); setStep(to);
    } catch { setErr(SAVE_ERR); } finally { lock.current = false; setBusy(false); }
  };
  const back = (to: string) => { setErrors({}); setErr(null); setDir(-1); setStep(to); };

  useEffect(() => {
    if (step !== 'name' || c.name.trim().length < 3) { setDup(''); return; }
    const t = setTimeout(async () => {
      try { const r = await organizationService.searchOrganizations(c.name.trim()); setDup(r.length ? `${r.length} existing compan${r.length === 1 ? 'y has' : 'ies have'} a similar name. If yours is already on LANSA, join it instead.` : ''); } catch { /* advisory only */ }
    }, 400);
    return () => clearTimeout(t);
  }, [c.name, step]);

  const location = [c.city, c.country].filter(Boolean).join(', ');
  const preview = <MiniCompanyCard name={c.name} industry={c.industry} size={c.size_range} location={location} description={c.description} website={c.website} logo={logo} />;
  const common = { stepKey: step, direction: dir, progress: progressFor('create_org', step), busy, error: err };
  const set = (k: string, v: string) => setC((x) => ({ ...x, [k]: v }));

  const create = async () => {
    if (lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try {
      let id = draft?.created_org_id;
      if (!id) {
        // Never create twice: a membership as owner of an org with this name means the earlier attempt succeeded.
        const { data: mine } = await supabase.from('organization_memberships').select('organization_id, role, organizations(name)').eq('user_id', userId).eq('role', 'owner');
        const existing = (mine || []).find((m: any) => m.organizations?.name?.trim().toLowerCase() === c.name.trim().toLowerCase());
        if (existing) {
          // Earlier attempt created it; make sure the fields that need a second write are saved.
          id = (existing as any).organization_id;
          if (c.city.trim() || c.country.trim()) await organizationService.updateOrganization(id!, { city: c.city.trim() || undefined, country: c.country.trim() || undefined } as any);
        }
        else {
          const { organization } = await organizationService.createOrganization({
            name: c.name.trim(), industry: c.industry || undefined, size_range: c.size_range || undefined,
            description: c.description.trim() || undefined, website: c.website.trim() || undefined,
            country: c.country.trim() || undefined, city: c.city.trim() || undefined,
          });
          id = organization.id;
        }
      }
      const next = await saveDraft(userId, draft, { user_intent: 'create_org', step: 'logo', company: c, created_org_id: id });
      setDraft(next);
      await refreshOrganization();
      setDir(1); setStep('logo');
    } catch (e: any) {
      setErr(e?.message ? `We couldn’t create the company: ${e.message}` : SAVE_ERR);
    } finally { lock.current = false; setBusy(false); }
  };

  const uploadLogo = async () => {
    const id = draft?.created_org_id;
    if (!logoFile || !id) return go('done');
    if (lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try {
      if (logoFile.size > 2048 * 1024) throw new Error('Logo must be under 2MB');
      const ext = logoFile.name.split('.').pop();
      const path = `company-logos/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('user-uploads').upload(path, logoFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('user-uploads').getPublicUrl(path);
      await organizationService.updateOrganization(id, { logo_url: publicUrl });
      await refreshOrganization();
      setLogoFile(null);
      const next = await saveDraft(userId, draft, { user_intent: 'create_org', step: 'done' });
      setDraft(next); setDir(1); setStep('done');
    } catch (e: any) { setErr(e?.message || SAVE_ERR); } finally { lock.current = false; setBusy(false); }
  };

  switch (step) {
    case 'intro':
      return <CarouselFrame {...common} media={introImg} eyebrow="Hire on LANSA" title="Meet certified local talent, one card at a time" lead="Set up your company once. Candidates see your name, industry and story when you show interest or post a job." onBack={onChangeRole} onNext={() => go('name')} nextLabel="Set up my company" swipeable />;
    case 'name': {
      const submit = () => { const e = validateCompanyName(c.name); setErrors(e); if (!Object.keys(e).length) go('industry'); };
      return (
        <CarouselFrame {...common} aside={preview} title="What’s your company called?" lead="Use the name candidates know you by." onBack={() => back('intro')} onNext={submit}>
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
            <Field id="ob-cname" label="Company name" error={errors.name}><input id="ob-cname" className="ob-input" autoComplete="organization" value={c.name} maxLength={100} aria-invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <button type="submit" hidden />
          </form>
          {dup && <p className="ob-note" role="status">{dup}</p>}
        </CarouselFrame>
      );
    }
    case 'industry':
      return (
        <CarouselFrame {...common} aside={preview} title="What do you do, and how big are you?" lead="Both are optional, but help candidates understand you." onBack={() => back('name')} onNext={() => go('location')} onSkip={() => go('location')}>
          <p className="ob-label" id="ob-ind">Industry</p>
          <div className="ob-chips" role="radiogroup" aria-labelledby="ob-ind">
            {INDUSTRIES.map((i) => <button key={i} type="button" role="radio" aria-checked={c.industry === i} className={`ob-chip${c.industry === i ? ' is-on' : ''}`} onClick={() => set('industry', c.industry === i ? '' : i)}>{c.industry === i && <Check className="h-3.5 w-3.5" />}{i}</button>)}
          </div>
          <p className="ob-label" id="ob-size">Team size</p>
          <div className="ob-chips" role="radiogroup" aria-labelledby="ob-size">
            {SIZES.map((s) => <button key={s} type="button" role="radio" aria-checked={c.size_range === s} className={`ob-chip${c.size_range === s ? ' is-on' : ''}`} onClick={() => set('size_range', c.size_range === s ? '' : s)}>{c.size_range === s && <Check className="h-3.5 w-3.5" />}{s.replace(' employees', '')}</button>)}
          </div>
        </CarouselFrame>
      );
    case 'location':
      return (
        <CarouselFrame {...common} aside={preview} title="Where are you based?" onBack={() => back('industry')} onNext={() => go('about')} onSkip={() => go('about')}>
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); go('about'); }}>
            <Field id="ob-city" label="City"><input id="ob-city" className="ob-input" autoComplete="address-level2" placeholder="Willemstad" value={c.city} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field id="ob-country" label="Country"><input id="ob-country" className="ob-input" autoComplete="country-name" value={c.country} onChange={(e) => set('country', e.target.value)} /></Field>
            <button type="submit" hidden />
          </form>
        </CarouselFrame>
      );
    case 'about': {
      const submit = () => { const e = validateWebsite(c.website); setErrors(e); if (!Object.keys(e).length) go('review'); };
      return (
        <CarouselFrame {...common} aside={preview} title="Tell candidates about you" lead="A short description and your website. Both optional." onBack={() => back('location')} onNext={submit} onSkip={() => { setC((x) => ({ ...x, website: validateWebsite(x.website).website ? '' : x.website })); go('review'); }}>
          <Field id="ob-desc" label="Description" hint={`${c.description.length}/400`}><textarea id="ob-desc" className="ob-input ob-textarea" rows={4} maxLength={400} value={c.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <Field id="ob-web" label="Website" error={errors.website}><input id="ob-web" className="ob-input" type="url" inputMode="url" placeholder="https://" value={c.website} aria-invalid={!!errors.website} onChange={(e) => set('website', e.target.value)} /></Field>
        </CarouselFrame>
      );
    }
    case 'review':
      return (
        <CarouselFrame {...common} title="Does this look right?" lead="Creating the company makes you its owner. You can edit everything later in Company settings." onBack={() => back('about')} onNext={create} nextLabel="Create company">
          <div className="ob-review">{preview}</div>
        </CarouselFrame>
      );
    case 'logo':
      return (
        <CarouselFrame {...common} aside={preview} title="Add your logo" lead="Square images look best. PNG or JPG, under 2MB." onNext={uploadLogo} nextLabel={logoFile ? 'Upload logo' : 'Continue'} onSkip={logoFile ? undefined : () => go('done')}>
          <label className="ob-upload">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0] || null; setLogoFile(f); setLogo(f ? URL.createObjectURL(f) : null); }} />
            <Upload className="h-5 w-5" /> {logoFile ? logoFile.name : 'Choose an image'}
          </label>
        </CarouselFrame>
      );
    default:
      return <DoneCard media={doneImg} preview={preview} title={`${c.name.trim() || 'Your company'} is on LANSA`} lead="Your workspace is ready. Post your first job so certified candidates can apply." actionLabel="Open my workspace" onAction={async () => { await onFinish(); navigate('/employer-dashboard?tab=jobs', { replace: true }); }} />;
  }
}

export function JoinCompanyFlow({ userId, draft, setDraft, onChangeRole, onFinish, inviteToken }: FlowProps & { inviteToken?: string | null }) {
  const navigate = useNavigate();
  const { refreshOrganization } = useOrganization();
  const [step, setStep] = useState(() => inviteToken ? 'invite' : resumeStep('join_org', draft?.step, { requestSent: !!draft?.join_request_sent }));
  const [dir, setDir] = useState<1 | -1>(1);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Organization[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const lock = useRef(false);

  // Restore the picked company after a refresh.
  useEffect(() => {
    if (!draft?.join_org_id || selected) return;
    supabase.from('organizations').select('*').eq('id', draft.join_org_id).maybeSingle().then(({ data }) => { if (data) setSelected(data as Organization); });
  }, [draft?.join_org_id, selected]);

  useEffect(() => {
    if (step !== 'search' || q.trim().length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      setSearching(true); setErr(null);
      try { setResults(await organizationService.searchOrganizations(q.trim())); } catch { setErr('Search failed. Check your connection and try again.'); } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, step]);

  const save = async (to: string, patch: DraftInputs = {}) => {
    const next = await saveDraft(userId, draft, { user_intent: 'join_org', step: to, ...patch });
    setDraft(next);
  };
  const go = async (to: string, patch: DraftInputs = {}) => {
    if (lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try { await save(to, patch); setDir(1); setStep(to); } catch { setErr(SAVE_ERR); } finally { lock.current = false; setBusy(false); }
  };

  const request = async () => {
    if (!selected || lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try {
      try { await organizationService.requestToJoinOrganization(selected.id); }
      catch (e: any) {
        // An earlier tap or device already sent it; keep the pending request instead of failing.
        if (!/pending request|already a member/i.test(e?.message || '')) throw e;
      }
      await save('done', { join_org_id: selected.id, join_request_sent: true });
      await refreshOrganization();
      setDir(1); setStep('done');
    } catch (e: any) { setErr(e?.message || SAVE_ERR); } finally { lock.current = false; setBusy(false); }
  };

  const acceptInvite = async () => {
    if (!inviteToken || lock.current) return; lock.current = true; setBusy(true); setErr(null);
    try {
      await organizationService.acceptInvitation(inviteToken);
      try { sessionStorage.removeItem('lansa.invite_token'); } catch { /* ignore */ }
      await save('done', { join_request_sent: false });
      await refreshOrganization();
      setAccepted(true); setDir(1); setStep('done');
    } catch (e: any) { setErr(e?.message || 'This invitation couldn’t be accepted. It may have expired.'); } finally { lock.current = false; setBusy(false); }
  };

  const prog = progressFor('join_org', step);
  const common = { stepKey: step, direction: dir, progress: prog, busy, error: err };
  const loc = (o: Organization) => [o.city, o.country].filter(Boolean).join(', ');
  const preview = selected ? <MiniCompanyCard name={selected.name} industry={selected.industry} size={selected.size_range} location={loc(selected)} logo={selected.logo_url} status={step === 'done' && !accepted ? 'Request pending' : undefined} /> : null;

  switch (step) {
    case 'invite':
      return <CarouselFrame stepKey="invite" direction={1} busy={busy} error={err} media={introImg} title="You’ve been invited to a team" lead="Accept to join with the role your admin chose." onBack={onChangeRole} onNext={acceptInvite} nextLabel="Accept invitation" />;
    case 'intro':
      return <CarouselFrame {...common} media={introImg} eyebrow="Join your team" title="Your company may already be on LANSA" lead="Find it and ask to join. A company admin approves you and decides your role, so you start without admin access." onBack={onChangeRole} onNext={() => go('search')} nextLabel="Find my company" swipeable />;
    case 'search':
      return (
        <CarouselFrame {...common} title="Find your company" onBack={() => { setDir(-1); setStep('intro'); }} nextDisabled={!selected} onNext={() => go('confirm', { join_org_id: selected?.id })}>
          <div className="ob-search">
            <Search className="h-4 w-4" aria-hidden />
            <input aria-label="Search companies" className="ob-search-input" placeholder="Company name" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} autoComplete="off" />
          </div>
          {selected && <p className="ob-hint" role="status">Selected: <strong>{selected.name}</strong></p>}
          <div className="ee-group ob-results" role="radiogroup" aria-label="Companies" aria-busy={searching}>
            {searching && <p className="ob-empty">Searching…</p>}
            {!searching && results && results.length === 0 && <p className="ob-empty">No companies match “{q.trim()}”. Check the spelling, or go back and create it.</p>}
            {!searching && !results && <p className="ob-empty">Type at least two letters.</p>}
            {!searching && results?.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={selected?.id === o.id} className={`ee-row ob-result${selected?.id === o.id ? ' is-on' : ''}`} onClick={() => setSelected(o)}>
                <span className="ee-row-icon">{o.logo_url ? <img src={o.logo_url} alt="" className="h-full w-full rounded-[12px] object-cover" /> : <Building2 className="h-4 w-4" />}</span>
                <span className="ee-row-text"><span className="ee-row-label">{o.name}</span><span className="ee-row-detail">{[o.industry, loc(o)].filter(Boolean).join(' · ') || 'Company'}</span></span>
                <span className="ob-radio" aria-hidden />
              </button>
            ))}
          </div>
        </CarouselFrame>
      );
    case 'confirm':
      return (
        <CarouselFrame {...common} title="Ask to join this company?" lead="We’ll send your request to its admins. You can browse your workspace while you wait." onBack={() => { setDir(-1); setStep('search'); }} nextDisabled={!selected} onNext={request} nextLabel="Send request">
          <div className="ob-review">{preview || <p className="ob-empty">Loading company…</p>}</div>
          <p className="ob-note"><ShieldCheck className="h-4 w-4" /> You join as a member. Only an admin can give you more access.</p>
        </CarouselFrame>
      );
    default:
      return (
        <DoneCard media={doneImg} preview={preview}
          title={accepted ? 'Welcome to the team' : 'Request sent'}
          lead={accepted ? 'Your workspace is ready.' : `An admin${selected ? ` at ${selected.name}` : ''} needs to approve you. Your workspace will show the pending status until then.`}
          actionLabel={accepted ? 'Open my workspace' : 'Go to my workspace'}
          onAction={async () => { await onFinish(); navigate('/employer-dashboard', { replace: true }); }} />
      );
  }
}

