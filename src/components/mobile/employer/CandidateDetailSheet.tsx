import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, GraduationCap, Award, Globe, X, Sparkles, BadgeCheck } from 'lucide-react';
import type { DiscoveryProfile } from '@/services/discoveryService';
import type { SwipeDirection } from '@/services/swipeService';
import { matchSummaryService } from '@/services/matchSummaryService';
import { CandidateActions } from './CandidateActions';
import { initials, skillNames } from './mobileDiscoveryModel';

interface CandidateDetailSheetProps { open: boolean; onOpenChange: (open: boolean) => void; profile: DiscoveryProfile | null; onAction: (direction: SwipeDirection) => void; userId?: string; disabled?: boolean }
export function CandidateDetailSheet({ open, onOpenChange, profile, onAction, userId, disabled }: CandidateDetailSheetProps) {
  const [insight, setInsight] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !profile || !userId) return;
    let active = true;
    setInsight(null);
    matchSummaryService.getMatchSummary(userId, profile).then(value => { if (active) setInsight(value); }).catch(() => { if (active) setInsight(matchSummaryService.generateFallbackSummary(profile)); });
    return () => { active = false; };
  }, [open, profile, userId]);
  if (!profile) return null;
  const skills = skillNames(profile);
  return <Drawer open={open} onOpenChange={value => { if (!disabled) onOpenChange(value); }} shouldScaleBackground={false}>
    <DrawerContent className="employer-theme discovery-sheet discovery-detail-sheet">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border shrink-0">
        <span className="text-sm font-semibold">Professional profile</span><Button variant="ghost" size="icon" className="w-11 h-11" disabled={disabled} aria-label="Close profile" onClick={() => onOpenChange(false)}><X size={22} /></Button>
      </div>
      <DrawerDescription className="sr-only">Professional background and qualifications of {profile.name}.</DrawerDescription>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="flex items-start gap-4 mb-6"><Avatar className="h-20 w-20 rounded-xl shrink-0"><AvatarImage src={profile.profile_image} alt="" className="object-cover object-[center_25%]" /><AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl rounded-xl">{initials(profile.name)}</AvatarFallback></Avatar>
          <div className="min-w-0"><DrawerTitle className="text-2xl break-words">{profile.name}</DrawerTitle><p className="text-sm mt-1">{profile.title}</p>{profile.location && <p className="text-xs text-muted-foreground mt-2 flex gap-1"><MapPin size={14} className="shrink-0" />{profile.location}</p>}{profile.isCertified && <p className="text-xs text-primary mt-2 flex items-center gap-1"><BadgeCheck size={14} />Lansa certified</p>}</div>
        </div>
        {userId && <Section title="Why this match" icon={<Sparkles size={17} />}><p className="text-sm text-muted-foreground leading-relaxed">{insight || 'Reviewing professional strengths…'}</p></Section>}
        {profile.about_text && <Section title="About"><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{profile.about_text}</p></Section>}
        {Boolean(profile.experiences?.length) && <Section title="Experience" icon={<Briefcase size={17} />}><div className="space-y-4">{profile.experiences?.map((e, i) => <div key={i} className="border-l-2 border-primary/25 pl-3"><h4 className="text-sm font-semibold">{e.title}</h4>{e.subtitle && <p className="text-sm text-muted-foreground">{e.subtitle}</p>}<p className="text-xs text-muted-foreground mt-1">{e.period}</p>{e.description && <p className="text-sm leading-relaxed mt-2 whitespace-pre-line">{e.description}</p>}</div>)}</div></Section>}
        {skills.length > 0 && <Section title="Skills"><div className="flex flex-wrap gap-2">{skills.map((s, i) => <Badge key={i} variant="outline" className="bg-primary/5 text-foreground py-1.5 px-3 break-words">{s}</Badge>)}</div></Section>}
        {Boolean(profile.languages?.length) && <Section title="Languages" icon={<Globe size={17} />}><p className="text-sm">{profile.languages?.join(' · ')}</p></Section>}
        {Boolean(profile.education?.length) && <Section title="Education" icon={<GraduationCap size={17} />}><div className="space-y-3">{profile.education?.map((e, i) => <div key={i}><h4 className="text-sm font-semibold">{e.title}</h4><p className="text-sm text-muted-foreground">{e.description}</p><p className="text-xs text-muted-foreground mt-1">{e.period}</p></div>)}</div></Section>}
        {profile.achievements?.some(a => a.isFeatured) && <Section title="Featured achievements" icon={<Award size={17} />}><div className="space-y-3">{profile.achievements.filter(a => a.isFeatured).map((a, i) => <div key={i}><h4 className="text-sm font-semibold">{a.title}</h4><p className="text-sm text-muted-foreground">{a.description}</p></div>)}</div></Section>}
        {profile.professional_goal && <Section title="Professional goal"><p className="text-sm text-muted-foreground">{profile.professional_goal}</p></Section>}
        {profile.biggest_challenge && <Section title="Biggest challenge"><p className="text-sm text-muted-foreground">{profile.biggest_challenge}</p></Section>}
      </div>
      <div className="discovery-sheet-footer !p-0 border-t border-border"><CandidateActions disabled={disabled} onAction={onAction} /></div>
    </DrawerContent>
  </Drawer>;
}
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <section className="py-5 border-t border-border"><h3 className="text-base font-bold mb-3 flex items-center gap-2">{icon}{title}</h3>{children}</section>;
}
