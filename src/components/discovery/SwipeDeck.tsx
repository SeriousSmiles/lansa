import { useState, useEffect } from "react";
import { SwipeCard } from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { IconHeart, IconX, IconBolt } from "@tabler/icons-react";
import { DiscoveryProfile } from "@/services/discoveryService";
import { SwipeDirection } from "@/services/swipeService";
import { cn } from "@/lib/utils";

interface SwipeDeckProps {
  profiles: DiscoveryProfile[];
  onSwipe: (profile: DiscoveryProfile, direction: SwipeDirection) => void;
  onEndReached: () => void;
  isLoading?: boolean;
}

export function SwipeDeck({ profiles, onSwipe, onEndReached, isLoading }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const visibleCards = profiles.slice(currentIndex, currentIndex + 3);

  useEffect(() => {
    if (currentIndex >= profiles.length - 2 && !isLoading) {
      onEndReached();
    }
  }, [currentIndex, profiles.length, isLoading, onEndReached]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (isAnimating || currentIndex >= profiles.length) return;
    
    setIsAnimating(true);
    const currentProfile = profiles[currentIndex];
    
    // Call the swipe handler
    onSwipe(currentProfile, direction);
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleButtonSwipe = (direction: SwipeDirection) => {
    handleSwipe(direction);
  };

  if (profiles.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold mb-2">No more profiles!</h3>
        <p className="text-muted-foreground">
          You've seen all available profiles. Check back later for new opportunities!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center overflow-hidden w-full h-full">
      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[700px] mb-6 overflow-hidden">
        {visibleCards.map((profile, index) => {
          const cardIndex = currentIndex + index;
          const isActive = index === 0 && !isAnimating;
          const zIndex = visibleCards.length - index;
          const scale = 1 - (index * 0.05);
          const translateY = index * 8;
          
          return (
            <div
              key={profile.user_id}
              className="absolute inset-0"
              style={{
                zIndex,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: 'center bottom',
              }}
            >
              <SwipeCard
                profile={profile}
                onSwipe={handleSwipe}
                isActive={isActive}
                zIndex={zIndex}
              />
            </div>
          );
        })}
        
        {isLoading && visibleCards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleButtonSwipe('left')}
          disabled={isAnimating || currentIndex >= profiles.length}
          className={cn(
            "rounded-full w-14 h-14 p-0",
            "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          )}
        >
          <IconX className="w-6 h-6" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleButtonSwipe('nudge')}
          disabled={isAnimating || currentIndex >= profiles.length}
          className={cn(
            "rounded-full w-14 h-14 p-0",
            "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
          )}
        >
          <IconBolt className="w-6 h-6" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleButtonSwipe('right')}
          disabled={isAnimating || currentIndex >= profiles.length}
          className={cn(
            "rounded-full w-14 h-14 p-0",
            "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          )}
        >
          <IconHeart className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}