import { useEffect, useRef, useState } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Award, Loader2 } from 'lucide-react';
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

  // Guard against undefined profile
  if (!profile) {
    return null;
  }

  useEffect(() => {
    if (containerRef.current && profile?.user_id) {
      // Animate in the new content
      candidatePanelAnimations.enterLeftPanel(containerRef.current);
      candidatePanelAnimations.staggerLeftPanelElements(containerRef.current);
      
      // Call callback after animations complete
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 800);
      }
    }
  }, [profile?.user_id, onAnimationComplete]);

  // Load AI-powered match summary
  useEffect(() => {
    if (user?.id && profile?.user_id) {
      setIsLoadingSummary(true);
      matchSummaryService.getMatchSummary(user.id, profile)
        .then(summary => {
          setMatchSummary(summary);
        })
        .catch(error => {
          console.error('Failed to load match summary:', error);
          // Fallback to generic summary
          setMatchSummary(profile.about_text?.slice(0, 150) + (profile.about_text && profile.about_text.length > 150 ? '...' : '') || 'No summary available');
        })
        .finally(() => {
          setIsLoadingSummary(false);
        });
    }
  }, [user?.id, profile.user_id]);

  const topSkills = profile.skills?.slice(0, 5) || [];
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div
      ref={containerRef}
      className="bg-background rounded-lg shadow-md p-10 h-full flex flex-col"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-8" data-animate="avatar">
        <Avatar className="w-36 h-36 border-4 border-primary/20">
          <AvatarImage src={profile.profile_image || undefined} alt={profile.name || ''} />
          <AvatarFallback className="text-4xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name with Certified Badge */}
      <div className="flex items-center justify-center gap-2 mb-3" data-animate="name">
        <h2 className="text-2xl font-bold text-center">
          {profile.name || 'Anonymous'}
        </h2>
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
          <Award className="w-3 h-3 mr-1" />
          Certified
        </Badge>
      </div>

      {/* Title */}
      <p className="text-lg text-muted-foreground text-center mb-2" data-animate="title">
        {profile.title || 'Professional'}
      </p>

      {/* Location */}
      {profile.location && (
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-8">
          <MapPin className="w-4 h-4" />
          <span>{profile.location}</span>
        </div>
      )}

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-sm px-3 py-1 hover:bg-secondary/80 transition-colors"
                data-animate="skill"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* AI-Powered Match Summary */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Why This Match?</h3>
        {isLoadingSummary ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing match compatibility...</span>
          </div>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">
            {matchSummary}
          </p>
        )}
      </div>
    </div>
  );
}
