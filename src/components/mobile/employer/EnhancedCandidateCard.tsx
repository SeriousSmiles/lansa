import { useState } from 'react';
import { MapPin, BadgeCheck, ArrowUpRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DiscoveryProfile } from '@/services/discoveryService';
import { initials, skillNames } from './mobileDiscoveryModel';

interface EnhancedCandidateCardProps {
  profile: DiscoveryProfile;
  className?: string;
  swipeDirection?: 'left' | 'right' | null;
  swipeProgress?: number;
  onTapExpand?: () => void;
  stackPosition?: number;
  userId?: string;
  disabled?: boolean;
}

export function EnhancedCandidateCard({ profile, className, swipeDirection, swipeProgress = 0, onTapExpand, stackPosition = 0, disabled }: EnhancedCandidateCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(profile.profile_image) && !photoFailed;
  const skills = skillNames(profile).slice(0, 3);
  const experience = profile.experiences?.find(e => e.title?.trim());
  return <article aria-label={stackPosition ? undefined : `${profile.name}, ${profile.title}`} aria-hidden={stackPosition > 0 || undefined}
    className={cn('discovery-portrait', stackPosition > 0 && 'discovery-portrait-next', className)}>
    {hasPhoto ? <img src={profile.profile_image} alt="" draggable={false} className="discovery-photo"
      onError={() => setPhotoFailed(true)} onLoad={event => {
        if (event.currentTarget.naturalWidth < 160 || event.currentTarget.naturalHeight < 160) setPhotoFailed(true);
      }} /> : <div className="discovery-monogram" aria-hidden="true"><span>{initials(profile.name)}</span><Briefcase size={28} /></div>}
    {hasPhoto && <div className="discovery-photo-scrim" />}
    {profile.isCertified && <div className="discovery-cert"><BadgeCheck size={15} aria-hidden="true" /><span>Lansa certified</span></div>}
    {stackPosition === 0 && swipeDirection && swipeProgress > 0.12 && <div className={cn('discovery-stamp', swipeDirection === 'left' ? 'discovery-stamp-pass' : 'discovery-stamp-interest')} aria-live="off">
      {swipeDirection === 'left' ? 'PASS' : 'INTERESTED'}
    </div>}
    <div className="discovery-identity">
      <h2>{profile.name}</h2>
      {profile.title && <p className="discovery-role">{profile.title}</p>}
      {profile.location && <p className="discovery-location"><MapPin size={13} aria-hidden="true" /><span>{profile.location}</span></p>}
      <div className="discovery-evidence">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{skills.length ? 'Professional strengths' : experience ? 'Experience highlight' : 'Professional profile'}</span>
          {onTapExpand && <Button variant="ghost" disabled={disabled} className="discovery-profile-button" onPointerDown={e => e.stopPropagation()} onClick={onTapExpand}>
            View profile <ArrowUpRight size={15} aria-hidden="true" />
          </Button>}
        </div>
        {skills.length ? <ul className="discovery-skills">{skills.map((skill, i) => <li key={i}>{skill}</li>)}</ul>
          : experience ? <div className="text-sm"><p className="font-semibold line-clamp-2">{experience.title}</p>{experience.subtitle && <p className="text-xs text-muted-foreground truncate">{experience.subtitle}</p>}</div>
          : profile.about_text ? <p className="text-sm line-clamp-2">{profile.about_text}</p>
          : <p className="text-sm text-muted-foreground">{profile.title || profile.name}</p>}
      </div>
    </div>
  </article>;
}
