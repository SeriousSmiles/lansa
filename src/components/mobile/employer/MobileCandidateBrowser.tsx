import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star, Filter, ArrowLeft, Users, TrendingUp } from "lucide-react";
import { SwipeableContainer } from "@/components/mobile/SwipeableContainer";
import { MobileCardLayout } from "@/components/mobile/MobileCardLayout";
import { mobileAnimations, mobileUtils } from "@/utils/mobileAnimations";
import { gsap } from "gsap";
import type { DiscoveryProfile } from "@/services/discoveryService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileCandidateBrowserProps {
  profiles: DiscoveryProfile[];
  onSwipe: (profile: DiscoveryProfile, direction: 'left' | 'right' | 'nudge') => void;
  onBack: () => void;
  onLoadMore: () => void;
  matchCount: number;
  todayCount: number;
  isLoading?: boolean;
}

export function MobileCandidateBrowser({
  profiles,
  onSwipe,
  onBack,
  onLoadMore,
  matchCount,
  todayCount,
  isLoading = false
}: MobileCandidateBrowserProps) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    if (headerRef.current) {
      mobileAnimations.pageSlideIn(headerRef.current);
    }
  }, []);

  const handleSwipeAction = async (direction: 'left' | 'right' | 'nudge') => {
    if (!currentProfile || isAnimating) return;

    setIsAnimating(true);
    
    // Haptic feedback
    mobileUtils.hapticFeedback(direction === 'nudge' ? 'medium' : 'light');

    // Animate card out
    if (cardRef.current) {
      const exitDirection = direction === 'left' ? 'left' : 'right';
      await mobileAnimations.pageSlideOut(cardRef.current, exitDirection);
    }

    // Call swipe handler
    onSwipe(currentProfile, direction);

    // Move to next profile
    const nextIndex = currentProfileIndex + 1;
    if (nextIndex >= profiles.length - 2) {
      onLoadMore(); // Load more when approaching end
    }

    if (nextIndex < profiles.length) {
      setCurrentProfileIndex(nextIndex);
    }

    setIsAnimating(false);
  };

  const getProfileInitials = (profile: DiscoveryProfile) => {
    const name = profile.name || profile.professional_goal || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!currentProfile && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No more candidates</h3>
          <p className="text-muted-foreground">Check back later for new profiles</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <div ref={headerRef} className="mobile-safe-top bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="text-center">
              <h1 className="font-semibold text-foreground">Browse Candidates</h1>
              <p className="text-xs text-muted-foreground">
                {currentProfileIndex + 1} of {profiles.length}
              </p>
            </div>

            <Button variant="ghost" size="sm">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{matchCount}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{todayCount}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1">
        {currentProfile ? (
          <div className="max-w-sm mx-auto">
            <SwipeableContainer
              onSwipeLeft={() => handleSwipeAction('left')}
              onSwipeRight={() => handleSwipeAction('right')}
              className="h-full"
            >
              <MobileCardLayout 
                className="p-0 overflow-hidden h-[calc(100vh-250px)] max-h-[600px]"
                enableParallax
              >
                {/* Profile Image/Avatar */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {getProfileInitials(currentProfile)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Overlay with key info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h2 className="text-xl font-bold text-white">
                      {currentProfile.name || 'Anonymous User'}
                    </h2>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-4">
                  {currentProfile.professional_goal && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {currentProfile.professional_goal}
                      </h3>
                    </div>
                  )}

                  {currentProfile.skills && currentProfile.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </MobileCardLayout>
            </SwipeableContainer>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-6 mt-6 px-4">
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                onClick={() => handleSwipeAction('left')}
                disabled={isAnimating}
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                onClick={() => handleSwipeAction('nudge')}
                disabled={isAnimating}
              >
                <Star className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                onClick={() => handleSwipeAction('right')}
                disabled={isAnimating}
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-6 px-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <span>Pass • Not a fit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Super Like • Stand out</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Like • Interested</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading candidates...</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}