import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Filter, ArrowLeft, Users, TrendingUp, Zap } from "lucide-react";
import { SwipeableContainer } from "../SwipeableContainer";
import { EnhancedCandidateCard } from "./EnhancedCandidateCard";
import { mobileAnimations, mobileUtils } from "@/utils/mobileAnimations";
import { gsap } from "gsap";
import type { DiscoveryProfile } from "@/services/discoveryService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { candidateDiscoveryService, CandidateFilters } from "@/services/candidateDiscoveryService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FilterModal } from "./MobileFilterModal";

interface MobileCandidateBrowserProps {
  userId: string;
  onBack: () => void;
  initialFilters?: CandidateFilters;
}

export function MobileCandidateBrowser({
  userId,
  onBack,
  initialFilters = {}
}: MobileCandidateBrowserProps) {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ matchCount: 0, todayCount: 0, weekCount: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    if (headerRef.current) {
      mobileAnimations.pageSlideIn(headerRef.current);
    }
    loadCandidates();
    loadStats();
  }, [filters]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const newProfiles = await candidateDiscoveryService.getFilteredCandidates(userId, filters, 20);
      setProfiles(newProfiles);
      setCurrentProfileIndex(0);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const swipeStats = await candidateDiscoveryService.getSwipeStats(userId);
      setStats(swipeStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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

    // Call swipe service
    try {
      const result = await candidateDiscoveryService.swipeCandidate(userId, currentProfile, direction);
      if (result.isMatch) {
        // Handle match - could show celebration animation
        loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error swiping candidate:', error);
    }

    // Move to next profile
    const nextIndex = currentProfileIndex + 1;
    if (nextIndex >= profiles.length - 2) {
      loadCandidates(); // Load more when approaching end
    }

    if (nextIndex < profiles.length) {
      setCurrentProfileIndex(nextIndex);
    } else {
      // No more profiles, reload
      loadCandidates();
    }

    setIsAnimating(false);
  };

  const applyFilters = (newFilters: CandidateFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
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

            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Candidates</DialogTitle>
                </DialogHeader>
                <FilterModal filters={filters} onApply={applyFilters} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{stats.matchCount}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{stats.todayCount}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Card Container */}
        <div className="flex-1 relative px-4">
          <div className="relative w-full h-[calc(100vh-280px)] max-h-[650px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : currentProfile ? (
              <SwipeableContainer
                onSwipeLeft={() => handleSwipeAction('left')}
                onSwipeRight={() => handleSwipeAction('right')}
                className="w-full h-full"
              >
                <EnhancedCandidateCard 
                  profile={currentProfile}
                  className="w-full h-full"
                />
              </SwipeableContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold mb-2">No More Candidates</h3>
                <p className="text-muted-foreground">
                  You've reviewed all available candidates. Check back later for more!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {currentProfile && (
          <div className="px-4 py-6">
            <div className="flex justify-center items-center gap-6">
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
                <Zap className="h-6 w-6" />
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
            <div className="mt-4 text-center text-xs text-muted-foreground space-y-1">
              <p>← Swipe left to pass • Swipe right to like →</p>
              <p>⚡ Tap lightning for super like</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}