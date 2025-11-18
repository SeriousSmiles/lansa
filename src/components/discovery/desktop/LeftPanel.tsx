import { useEffect, useRef } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';

interface LeftPanelProps {
  profile: DiscoveryProfile;
  onAnimationComplete?: () => void;
}

export function LeftPanel({ profile, onAnimationComplete }: LeftPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Animate in the new content
      candidatePanelAnimations.enterLeftPanel(containerRef.current);
      candidatePanelAnimations.staggerLeftPanelElements(containerRef.current);
      
      // Call callback after animations complete
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 800);
      }
    }
  }, [profile.user_id, onAnimationComplete]);

  const topSkills = profile.skills?.slice(0, 5) || [];
  const summary = profile.about_text?.slice(0, 150) + (profile.about_text && profile.about_text.length > 150 ? '...' : '') || 'No summary available';
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div
      ref={containerRef}
      className="bg-background rounded-lg shadow-sm p-8 h-full flex flex-col"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-6" data-animate="avatar">
        <Avatar className="w-32 h-32 border-4 border-primary/20">
          <AvatarImage src={profile.profile_image || undefined} alt={profile.name || ''} />
          <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold text-center mb-2" data-animate="name">
        {profile.name || 'Anonymous'}
      </h2>

      {/* Title */}
      <p className="text-lg text-muted-foreground text-center mb-1" data-animate="title">
        {profile.title || 'Professional'}
      </p>

      {/* Location */}
      {profile.location && (
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-6">
          <MapPin className="w-4 h-4" />
          <span>{profile.location}</span>
        </div>
      )}

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-sm"
                data-animate="skill"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quick Summary */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Summary</h3>
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
          {summary}
        </p>
      </div>
    </div>
  );
}
