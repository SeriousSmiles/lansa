import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { DiscoveryProfile } from '@/services/discoveryService';
import { SwipeDirection } from '@/services/swipeService';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ActionButtonBar } from './ActionButtonBar';
import { useCandidateNavigation } from '@/hooks/useCandidateNavigation';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';
import { AlertCircle, Users } from 'lucide-react';

interface SplitPanelBrowserProps {
  profiles: DiscoveryProfile[];
  onSwipe: (profile: DiscoveryProfile, direction: SwipeDirection) => void;
  onEndReached: () => void;
  isLoading: boolean;
}

export function SplitPanelBrowser({
  profiles,
  onSwipe,
  onEndReached,
  isLoading
}: SplitPanelBrowserProps) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

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

    // Animate exit on wrapper divs
    if (leftPanelRef.current) {
      candidatePanelAnimations.exitLeftPanel(leftPanelRef.current);
    }
    if (rightPanelRef.current) {
      candidatePanelAnimations.exitRightPanel(rightPanelRef.current);
    }

    // Wait for exit animations to complete
    await new Promise(resolve => setTimeout(resolve, 450));

    // Process the swipe
    await onSwipe(currentProfile, direction);

    // CRITICAL FIX: Reset parent wrapper opacity/transform so child enter animations are visible
    if (leftPanelRef.current) {
      gsap.set(leftPanelRef.current, { clearProps: 'all' });
    }
    if (rightPanelRef.current) {
      gsap.set(rightPanelRef.current, { clearProps: 'all' });
    }

    // Move to next profile
    advanceToNext();

    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const hasReachedEnd = currentIndex >= totalProfiles - 1 && totalProfiles > 0;

  if (!currentProfile && !isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-300px)]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Certified Candidates Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            All certified candidates have been reviewed. Check back later for more certified professionals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {currentIndex + 1} <span className="text-muted-foreground font-normal">of {totalProfiles} candidates</span>
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalProfiles, 8) }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? 'bg-primary/30'
                  : i === currentIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Split Panel Container */}
      <div className="flex-1 grid grid-cols-[40%_60%] overflow-hidden">
        {/* Left Panel wrapper */}
        <div ref={leftPanelRef} className="h-full overflow-hidden border-r border-border/50">
          <LeftPanel profile={currentProfile} />
        </div>

        {/* Right Panel wrapper */}
        <div ref={rightPanelRef} className="h-full overflow-hidden">
          <RightPanel profile={currentProfile} />
        </div>
      </div>

      {/* End of List Message */}
      {hasReachedEnd && (
        <div className="text-center py-4 border-t border-border bg-muted/20">
          <p className="text-sm font-medium text-muted-foreground">
            You've reviewed all available certified candidates — check back soon
          </p>
        </div>
      )}

      {/* Action Buttons — sticky at bottom */}
      <ActionButtonBar
        onAction={handleAction}
        disabled={isAnimating || isLoading || hasReachedEnd}
      />
    </div>
  );
}
