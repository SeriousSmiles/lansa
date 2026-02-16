import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Award, User, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscoveryProfile } from "@/services/discoveryService";
import { SwipeOverlayIndicator } from "./SwipeOverlayIndicator";

interface EnhancedCandidateCardProps {
  profile: DiscoveryProfile;
  className?: string;
  swipeDirection?: 'left' | 'right' | null;
  swipeProgress?: number;
  onTapExpand?: () => void;
  stackPosition?: number; // 0 = top, 1 = behind, 2 = furthest
}

export function EnhancedCandidateCard({
  profile,
  className,
  swipeDirection = null,
  swipeProgress = 0,
  onTapExpand,
  stackPosition = 0,
}: EnhancedCandidateCardProps) {
  const skillNames: string[] = Array.isArray(profile.skills)
    ? profile.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).slice(0, 5)
    : [];

  const accentColor = profile.highlight_color || 'hsl(var(--primary))';
  const coverColor = profile.cover_color || accentColor;

  // Stack visual offsets
  const stackScale = 1 - stackPosition * 0.04;
  const stackY = stackPosition * 8;
  const stackOpacity = stackPosition === 0 ? 1 : stackPosition === 1 ? 0.7 : 0.4;

  return (
    <div
      className={cn(
        "absolute inset-0 rounded-2xl shadow-xl overflow-hidden bg-card border border-border/30 flex flex-col select-none",
        stackPosition === 0 && "z-10",
        stackPosition === 1 && "z-[5]",
        stackPosition === 2 && "z-0",
        className
      )}
      style={{
        transform: `translateY(${stackY}px) scale(${stackScale})`,
        opacity: stackOpacity,
        pointerEvents: stackPosition === 0 ? 'auto' : 'none',
      }}
    >
      {/* Swipe overlay indicator - only on top card */}
      {stackPosition === 0 && (
        <SwipeOverlayIndicator direction={swipeDirection} progress={swipeProgress} />
      )}

      {/* Cover header */}
      <div
        className="relative p-5 pb-14 flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${coverColor}, ${accentColor})`,
        }}
      >
        {/* Certification badge */}
        {profile.isCertified && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white tracking-wide">CERTIFIED</span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-3 ring-white/30 shadow-lg flex-shrink-0">
            <AvatarImage src={profile.profile_image} alt={profile.name} />
            <AvatarFallback
              style={{ backgroundColor: accentColor }}
              className="text-white text-xl font-semibold"
            >
              {profile.name?.charAt(0) || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 text-white">
            <h2 className="text-xl font-bold truncate">{profile.name}</h2>
            <p className="text-white/90 text-sm truncate">{profile.title}</p>
            {profile.location && (
              <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{profile.location}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content body */}
      <div className="flex-1 relative -mt-6 rounded-t-2xl bg-card overflow-y-auto">
        <div className="p-5 space-y-4">
          {/* Skills chips */}
          {skillNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skillNames.map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[11px] font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor: `${accentColor}12`,
                    borderColor: `${accentColor}25`,
                    color: accentColor,
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio snippet */}
          {profile.about_text && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {profile.about_text}
            </p>
          )}

          {/* Professional goal */}
          {profile.professional_goal && (
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Goal</p>
              <p className="text-sm text-foreground line-clamp-2">{profile.professional_goal}</p>
            </div>
          )}

          {/* Latest experience */}
          {profile.experiences && profile.experiences.length > 0 && (
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${accentColor}18` }}
              >
                <Briefcase className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile.experiences[0].title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.experiences[0].subtitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tap to expand hint */}
        {onTapExpand && stackPosition === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTapExpand();
            }}
            className="w-full py-3 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Tap to see full profile
          </button>
        )}
      </div>
    </div>
  );
}
