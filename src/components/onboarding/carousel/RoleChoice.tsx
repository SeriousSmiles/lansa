import { useState } from "react";
import { Briefcase, Building2, Users } from "lucide-react";
import { CarouselFrame } from "./CarouselFrame";
import { MiniProfileCard, MiniCompanyCard } from "./Previews";
import type { OnboardingIntent } from "./onboardingFlowModel";
import heroImg from "@/assets/landing/people/p1-couch-phone.jpg";

type Props = { initial: OnboardingIntent | null; employerHint: boolean; busy: boolean; error: string | null; onSelect: (i: OnboardingIntent) => void };

/** First card: one choice, a visibly different preview for each role. */
export function RoleChoice({ initial, employerHint, busy, error, onSelect }: Props) {
  const [v, setV] = useState<OnboardingIntent | null>(initial);
  const opts: { value: OnboardingIntent; label: string; detail: string; icon: JSX.Element }[] = [
    { value: 'job_seeker', label: 'I’m looking for work', detail: 'Build a professional card employers can find', icon: <Briefcase className="h-5 w-5" /> },
    { value: 'create_org', label: 'I’m hiring for my company', detail: 'Set up your company and post jobs', icon: <Building2 className="h-5 w-5" /> },
    { value: 'join_org', label: 'My company is already on LANSA', detail: 'Ask to join your team’s workspace', icon: <Users className="h-5 w-5" /> },
  ];
  const ordered = employerHint ? [opts[1], opts[2], opts[0]] : opts;
  const preview = v === 'job_seeker'
    ? <MiniProfileCard name="Your name" title="Your headline" skills={['Your skills']} />
    : v ? <MiniCompanyCard name={v === 'join_org' ? 'Your team' : 'Your company'} industry="Industry" location="Curaçao" status={v === 'join_org' ? 'Admin approves you' : undefined} /> : null;

  return (
    <CarouselFrame stepKey="role" direction={1} media={v ? undefined : heroImg} eyebrow="Welcome to LANSA" title="What brings you here?"
      lead="Pick one. You’ll set it up in a few short steps." aside={preview} busy={busy} error={error}
      nextDisabled={!v} onNext={() => v && onSelect(v)} nextLabel="Continue">
      <div className="ob-choices" role="radiogroup" aria-label="What brings you here">
        {ordered.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={v === o.value} className={`ob-choice${v === o.value ? ' is-on' : ''}`} onClick={() => setV(o.value)}>
            <span className="ob-choice-icon">{o.icon}</span>
            <span className="ob-choice-text"><strong>{o.label}</strong><small>{o.detail}</small></span>
            <span className="ob-radio" aria-hidden />
          </button>
        ))}
      </div>
      <button type="button" className="ob-alt" onClick={() => onSelect('mentor')}>I’m a mentor or teacher</button>
    </CarouselFrame>
  );
}
