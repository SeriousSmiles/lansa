import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Award, User, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscoveryProfile } from "@/services/discoveryService";
import { SwipeOverlayIndicator } from "./SwipeOverlayIndicator";
import { matchSummaryService } from "@/services/matchSummaryService";

interface EnhancedCandidateCardProps {
  profile: DiscoveryProfile;
  className?: string;
  swipeDirection?: 'left' | 'right' | null;
  swipeProgress?: number;
  onTapExpand?: () => void;
  stackPosition?: number;
  userId?: string;
}

export function EnhancedCandidateCard({
  profile,
  className,
  swipeDirection = null,
  swipeProgress = 0,
  onTapExpand,
  stackPosition = 0,
  userId,
}: EnhancedCandidateCardProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const skillNames: string[] = Array.isArray(profile.skills)
    ? profile.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).slice(0, 5)
    : [];

  const accentColor = profile.highlight_color || 'hsl(var(--primary))';
  const coverColor = profile.cover_color || accentColor;

  // Only fetch AI summary for the top card
  useEffect(() => {
    if (stackPosition !== 0 || !userId) return;
    setIsLoadingSummary(true);
    matchSummaryService.getMatchSummary(userId, profile)
      .then(summary => setAiSummary(summary))
      .finally(() => setIsLoadingSummary(false));
  }, [stackPosition, userId, profile.user_id]);

  // Stack visual offsets
  const stackScale = 1 - stackPosition * 0.04;
  const stackY = stackPosition * 8;
  const stackOpacity = stackPosition === 0 ? 1 : stackPosition === 1 ? 0.7 : 0.4;

  const handleContentTap = () => {
    if (swipeProgress < 0.1 && onTapExpand) {
      onTapExpand();
    }
  };

  const summaryText = aiSummary || (stackPosition === 0 ? matchSummaryService.generateFallbackSummary(profile) : null);

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
        style={{ background: `linear-gradient(135deg, ${coverColor}, ${accentColor})` }}
      >
        {profile.isCertified && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white tracking-wide">CERTIFIED</span>
          </div>
        )}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-4 ring-white/30 shadow-lg flex-shrink-0">
            <AvatarImage src={profile.profile_image} alt={profile.name} />
            <AvatarFallback style={{ backgroundColor: accentColor }} className="text-white text-xl font-semibold">
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

      {/* Content body — tappable to open drawer */}
      <div
        className="flex-1 relative -mt-6 rounded-t-2xl bg-card flex flex-col overflow-hidden cursor-pointer"
        onClick={handleContentTap}
      >
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Skills chips */}
          {skillNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skillNames.map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[11px] font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    borderColor: `${accentColor}30`,
                    color: accentColor,
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* AI Match Insight */}
          <div
            className="rounded-xl p-3.5"
            style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
                Why this match?
              </span>
            </div>
            {isLoadingSummary ? (
              <div className="space-y-1.5">
                <div className="h-3 bg-muted/60 rounded animate-pulse w-full" />
                <div className="h-3 bg-muted/60 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-foreground/85 leading-relaxed">
                {summaryText}
              </p>
            )}
          </div>

        </div>

        {/* Tap to expand — sticky footer */}
        {onTapExpand && stackPosition === 0 && (
          <div className="flex-shrink-0 w-full py-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground border-t border-border/30 bg-card">
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Tap to see full profile</span>
          </div>
        )}
      </div>
    </div>
  );
}
