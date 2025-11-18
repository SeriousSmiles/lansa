import { useRef, useEffect } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { SwipeDirection } from '@/services/swipeService';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ActionButtonBar } from './ActionButtonBar';
import { useCandidateNavigation } from '@/hooks/useCandidateNavigation';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';
import { AlertCircle } from 'lucide-react';

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
    goToNext,
    removeCurrentProfile,
    setIsAnimating
  } = useCandidateNavigation(profiles);

  useEffect(() => {
    // Trigger load more when approaching the end
    if (currentIndex >= totalProfiles - 3 && !isLoading) {
      onEndReached();
    }
  }, [currentIndex, totalProfiles, isLoading, onEndReached]);

  const handleAction = async (direction: SwipeDirection) => {
    if (!currentProfile || isAnimating) return;

    setIsAnimating(true);

    // Animate exit
    if (leftPanelRef.current) {
      candidatePanelAnimations.exitLeftPanel(leftPanelRef.current);
    }
    if (rightPanelRef.current) {
      candidatePanelAnimations.exitRightPanel(rightPanelRef.current);
    }

    // Wait for exit animations
    await new Promise(resolve => setTimeout(resolve, 450));

    // Process the swipe
    await onSwipe(currentProfile, direction);
    
    // Remove current profile and move to next
    removeCurrentProfile();
    
    // Allow animations to proceed
    setIsAnimating(false);
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-300px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Certified Candidates Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            All certified candidates have been reviewed. Check back later for more certified professionals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Split Panel Container */}
      <div className="flex-1 grid grid-cols-[40%_60%] gap-6 mb-6 overflow-hidden">
        {/* Left Panel */}
        <div ref={leftPanelRef} className="h-full overflow-hidden">
          <LeftPanel profile={currentProfile} />
        </div>

        {/* Right Panel */}
        <div ref={rightPanelRef} className="h-full overflow-hidden">
          <RightPanel profile={currentProfile} />
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtonBar
        onAction={handleAction}
        disabled={isAnimating || isLoading}
      />
    </div>
  );
}
