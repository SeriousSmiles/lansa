import { Building2, MapPin, Eye, EyeOff } from "lucide-react";
import { initials } from "@/components/feed/careerFeedModel";

export function MiniProfileCard(p: { name: string; title: string; location?: string; goal?: string; skills: string[]; photo?: string | null; visibility?: string; background?: string[] }) {
  const name = p.name.trim() || 'Your name';
  return (
    <div className="ob-mini" data-testid="mini-profile">
      <div className="ob-mini-photo">
        {p.photo ? <img src={p.photo} alt="" /> : <span>{initials(name)}</span>}
      </div>
      <div className="ob-mini-body">
        <strong className="ob-mini-name">{name}</strong>
        <span className="ob-mini-title">{p.title.trim() || 'Your headline'}</span>
        {p.location && <span className="ob-mini-meta"><MapPin className="h-3 w-3" />{p.location}</span>}
        {p.goal && <p className="ob-mini-goal">{p.goal}</p>}
        {p.skills.length > 0 && (
          <div className="ob-mini-chips">{p.skills.slice(0, 5).map((s) => <span key={s}>{s}</span>)}</div>
        )}
        {p.background && p.background.length > 0 && (
          <ul className="ob-mini-bg">{p.background.slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}</ul>
        )}
        {p.visibility && (
          <span className="ob-mini-vis">{p.visibility === 'Only you' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {p.visibility}</span>
        )}
      </div>
    </div>
  );
}

export function MiniCompanyCard(p: { name: string; industry?: string; size?: string; location?: string; description?: string; website?: string; logo?: string | null; status?: string }) {
  return (
    <div className="ob-mini is-company" data-testid="mini-company">
      <div className="ob-mini-logo">{p.logo ? <img src={p.logo} alt="" /> : p.name.trim() ? <span>{p.name.trim()[0].toUpperCase()}</span> : <Building2 className="h-7 w-7" />}</div>
      <div className="ob-mini-body">
        <strong className="ob-mini-name">{p.name.trim() || 'Your company'}</strong>
        <span className="ob-mini-title">{[p.industry, p.size].filter(Boolean).join(' · ') || 'Industry · size'}</span>
        {p.location && <span className="ob-mini-meta"><MapPin className="h-3 w-3" />{p.location}</span>}
        {p.description && <p className="ob-mini-goal">{p.description}</p>}
        {p.website && <span className="ob-mini-meta">{p.website.replace(/^https?:\/\//, '')}</span>}
        {p.status && <span className="ob-mini-vis">{p.status}</span>}
      </div>
    </div>
  );
}
