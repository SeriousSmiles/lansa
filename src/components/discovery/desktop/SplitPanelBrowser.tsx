import { useEffect } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { SwipeDirection } from '@/services/swipeService';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ActionButtonBar } from './ActionButtonBar';
import { useCandidateNavigation } from '@/hooks/useCandidateNavigation';
import { Users } from 'lucide-react';

interface SplitPanelBrowserProps {
  profiles: DiscoveryProfile[];
  onSwipe: (profile: DiscoveryProfile, direction: SwipeDirection) => void;
  onEndReached: () => void;
  isLoading: boolean;
  matchCount?: number;
  swipeCount?: number;
}

export function SplitPanelBrowser({
  profiles,
  onSwipe,
  onEndReached,
  isLoading,
  matchCount = 0,
  swipeCount = 0,
}: SplitPanelBrowserProps) {
  const {
    currentProfile,
    currentIndex,
    totalProfiles,
    isAnimating,
    advanceToNext,
    setIsAnimating
  } = useCandidateNavigation(profiles);

  useEffect(() => {
    if (currentIndex >= totalProfiles - 3 && !isLoading) {
      onEndReached();
    }
  }, [currentIndex, totalProfiles, isLoading, onEndReached]);

  const handleAction = async (direction: SwipeDirection) => {
    if (!currentProfile || isAnimating) return;
    setIsAnimating(true);
    await onSwipe(currentProfile, direction);
    advanceToNext();
    setTimeout(() => setIsAnimating(false), 100);
  };

  const hasReachedEnd = currentIndex >= totalProfiles && totalProfiles > 0;
  const progress = totalProfiles > 0 ? ((currentIndex + 1) / totalProfiles) * 100 : 0;

  if (!currentProfile && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Candidates Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            All certified candidates have been reviewed. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">

      {/* Top stats + progress strip */}
      <div className="shrink-0 border-b border-border px-5 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {currentIndex + 1}
              <span className="font-normal text-muted-foreground"> of {totalProfiles} candidates</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline">{matchCount} matches</span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline">{swipeCount} swipes today</span>
          </div>
        </div>
        {/* Thin progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex-1 grid grid-cols-[38%_62%] overflow-hidden">
        {/* Left Panel */}
        <div
          key={`left-${currentProfile?.user_id}`}
          className="h-full overflow-hidden border-r border-border animate-fade-in"
        >
          {currentProfile && <LeftPanel profile={currentProfile} />}
        </div>

        {/* Right Panel */}
        <div
          key={`right-${currentProfile?.user_id}`}
          className="h-full overflow-hidden animate-fade-in"
        >
          {currentProfile && <RightPanel profile={currentProfile} />}
        </div>
      </div>

      {/* End of list notice */}
      {hasReachedEnd && (
        <div className="shrink-0 text-center py-2.5 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">
            You've reviewed all available candidates — check back soon
          </p>
        </div>
      )}

      {/* Action buttons */}
      <ActionButtonBar
        onAction={handleAction}
        disabled={isAnimating || isLoading || hasReachedEnd}
      />
    </div>
  );
}
