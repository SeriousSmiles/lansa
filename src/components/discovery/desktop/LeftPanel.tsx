import { useEffect, useRef, useState } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Award, Loader2, Sparkles } from 'lucide-react';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';
import { matchSummaryService } from '@/services/matchSummaryService';
import { useAuth } from '@/contexts/AuthContext';

interface LeftPanelProps {
  profile: DiscoveryProfile;
  onAnimationComplete?: () => void;
}

export function LeftPanel({ profile, onAnimationComplete }: LeftPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [matchSummary, setMatchSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (containerRef.current && profile?.user_id) {
      candidatePanelAnimations.enterLeftPanel(containerRef.current);
      candidatePanelAnimations.staggerLeftPanelElements(containerRef.current);
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 800);
      }
    }
  }, [profile?.user_id, onAnimationComplete]);

  useEffect(() => {
    if (user?.id && profile?.user_id) {
      setIsLoadingSummary(true);
      matchSummaryService.getMatchSummary(user.id, profile)
        .then(summary => setMatchSummary(summary))
        .catch(() => {
          setMatchSummary(
            profile.about_text?.slice(0, 150) +
            (profile.about_text && profile.about_text.length > 150 ? '...' : '') ||
            'No summary available'
          );
        })
        .finally(() => setIsLoadingSummary(false));
    }
  }, [user?.id, profile?.user_id]);

  if (!profile) return null;

  const topSkills = profile.skills?.slice(0, 5) || [];
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-background overflow-y-auto"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Header gradient area with avatar */}
      <div
        className="relative flex flex-col items-center pt-10 pb-8 px-8"
        style={{ background: 'linear-gradient(160deg, hsl(var(--primary)/0.08) 0%, hsl(var(--background)) 100%)' }}
      >
        {/* Certified badge — top right corner */}
        {profile.isCertified && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-0.5">
              <Award className="w-3 h-3 mr-1" />
              Certified
            </Badge>
          </div>
        )}

        {/* Avatar */}
        <div data-animate="avatar" className="mb-5">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-4 ring-background shadow-xl">
              <AvatarImage src={profile.profile_image || undefined} alt={profile.name || ''} />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {profile.isCertified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h2
          data-animate="name"
          className="text-2xl font-bold text-center text-foreground leading-tight mb-1"
        >
          {profile.name || 'Anonymous'}
        </h2>

        {/* Title */}
        <p
          data-animate="title"
          className="text-sm font-medium text-primary text-center mb-3"
        >
          {profile.title || 'Professional'}
        </p>

        {/* Location */}
        {profile.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile.location}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60 mx-6" />

      {/* Skills */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Top Skills
        </p>
        {topSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-2.5 py-1 font-medium"
                data-animate="skill"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No skills listed</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60 mx-6" />

      {/* AI Match Summary */}
      <div className="px-6 py-5 flex-1">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Why This Match?
          </p>
        </div>
        {isLoadingSummary ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing compatibility...</span>
          </div>
        ) : (
          <p className="text-sm text-foreground/75 leading-relaxed">
            {matchSummary || 'No match summary available.'}
          </p>
        )}
      </div>
    </div>
  );
}
