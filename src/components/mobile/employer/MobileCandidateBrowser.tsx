import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X, Filter, ArrowLeft, Users, Zap, Undo2 } from "lucide-react";
import { SwipeableContainer } from "../SwipeableContainer";
import { EnhancedCandidateCard } from "./EnhancedCandidateCard";
import { CandidateDetailSheet } from "./CandidateDetailSheet";
import { MatchCelebration } from "./MatchCelebration";
import { FilterDrawer } from "./MobileFilterModal";
import { mobileAnimations, mobileUtils } from "@/utils/mobileAnimations";
import { gsap } from "gsap";
import type { DiscoveryProfile } from "@/services/discoveryService";
import { candidateDiscoveryService, CandidateFilters } from "@/services/candidateDiscoveryService";
import { swipeService } from "@/services/swipeService";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);
  const [stats, setStats] = useState({ matchCount: 0, todayCount: 0, weekCount: 0 });

  // Swipe overlay state
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  // Detail sheet
  const [detailOpen, setDetailOpen] = useState(false);

  // Match celebration
  const [matchCandidate, setMatchCandidate] = useState<DiscoveryProfile | null>(null);

  // Undo state
  const [undoProfile, setUndoProfile] = useState<DiscoveryProfile | null>(null);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const thirdProfile = profiles[currentIndex + 2];

  // Load candidates
  useEffect(() => {
    loadCandidates();
    loadStats();
  }, [filters]);

  // Header animation on mount
  useEffect(() => {
    if (headerRef.current) {
      mobileAnimations.pageSlideIn(headerRef.current);
    }
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const newProfiles = await candidateDiscoveryService.getFilteredCandidates(userId, filters, 20);
      setProfiles(newProfiles);
      setCurrentIndex(0);
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

  const handleDragProgress = useCallback((dir: 'left' | 'right' | null, progress: number) => {
    setSwipeDir(dir);
    setSwipeProgress(progress);
  }, []);

  const handleSwipeAction = useCallback(async (direction: 'left' | 'right' | 'nudge') => {
    if (!currentProfile) return;

    mobileUtils.hapticFeedback(direction === 'nudge' ? 'medium' : 'light');

    // Store for undo (only on pass)
    if (direction === 'left') {
      setUndoProfile(currentProfile);
      if (undoTimer) clearTimeout(undoTimer);
      const timer = setTimeout(() => setUndoProfile(null), 4000);
      setUndoTimer(timer);
    } else {
      setUndoProfile(null);
    }

    // Record swipe
    try {
      const result = await candidateDiscoveryService.swipeCandidate(userId, currentProfile, direction);
      if (result.isMatch) {
        setMatchCandidate(currentProfile);
        loadStats();
      }
    } catch (error) {
      console.error('Error swiping candidate:', error);
    }

    // Advance
    const nextIdx = currentIndex + 1;
    if (nextIdx >= profiles.length - 3) {
      // Prefetch more
      candidateDiscoveryService.getFilteredCandidates(userId, filters, 20).then(more => {
        if (more.length > 0) {
          setProfiles(prev => [...prev, ...more]);
        }
      });
    }

    if (nextIdx < profiles.length) {
      setCurrentIndex(nextIdx);
    } else {
      loadCandidates();
    }

    // Update today count locally
    setStats(prev => ({ ...prev, todayCount: prev.todayCount + 1 }));
  }, [currentProfile, currentIndex, profiles, userId, filters, undoTimer]);

  const handleUndo = useCallback(async () => {
    if (!undoProfile) return;
    mobileUtils.hapticFeedback('medium');

    // Delete last swipe from DB
    await swipeService.deleteLastSwipe(userId, 'employee');

    // Re-insert at current position
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setProfiles(prev => {
      const updated = [...prev];
      updated.splice(Math.max(0, currentIndex - 1), 0, undoProfile);
      return updated;
    });

    setUndoProfile(null);
    if (undoTimer) clearTimeout(undoTimer);
    setStats(prev => ({ ...prev, todayCount: Math.max(0, prev.todayCount - 1) }));
  }, [undoProfile, userId, currentIndex, undoTimer]);

  const applyFilters = (newFilters: CandidateFilters) => {
    setFilters(newFilters);
  };

  const activeFilterCount = [
    filters.location,
    filters.skills?.length,
    filters.experienceLevel,
    filters.availability,
    filters.lansaCertified,
  ].filter(Boolean).length;

  // Empty state
  if (!currentProfile && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No more candidates</h3>
          <p className="text-muted-foreground text-sm">Check back later for new profiles</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Match Celebration Overlay */}
      {matchCandidate && (
        <MatchCelebration
          candidate={matchCandidate}
          onSendMessage={() => {
            setMatchCandidate(null);
            navigate('/chat');
          }}
          onKeepBrowsing={() => setMatchCandidate(null)}
        />
      )}

      {/* Header */}
      <div ref={headerRef} className="mobile-safe-top bg-background/90 backdrop-blur-sm border-b border-border/40 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <h1 className="font-semibold text-foreground text-sm">Browse Candidates</h1>
              {profiles.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {currentIndex + 1} of {profiles.length}
                </p>
              )}
            </div>

            <FilterDrawer filters={filters} onApply={applyFilters}>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Filter className="h-5 w-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </FilterDrawer>
          </div>

          {/* Compact stats row */}
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.matchCount}</span> matches
            </span>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.todayCount}</span> reviewed today
            </span>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 pt-4">
        <div className="relative w-full h-[calc(100vh-260px)] max-h-[640px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Third card (background) */}
              {thirdProfile && (
                <EnhancedCandidateCard
                  profile={thirdProfile}
                  stackPosition={2}
                />
              )}

              {/* Second card (behind) */}
              {nextProfile && (
                <EnhancedCandidateCard
                  profile={nextProfile}
                  stackPosition={1}
                />
              )}

              {/* Top card (swipeable) */}
              {currentProfile && (
                <SwipeableContainer
                  onSwipeLeft={() => handleSwipeAction('left')}
                  onSwipeRight={() => handleSwipeAction('right')}
                  onDragProgress={handleDragProgress}
                  className="absolute inset-0 z-10"
                >
                  <EnhancedCandidateCard
                    userId={userId}
                    profile={currentProfile}
                    stackPosition={0}
                    swipeDirection={swipeDir}
                    swipeProgress={swipeProgress}
                    onTapExpand={() => setDetailOpen(true)}
                  />
                </SwipeableContainer>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {currentProfile && (
        <div className="px-4 py-5 relative">
          {/* Undo FAB */}
          {undoProfile && (
            <button
              onClick={handleUndo}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground hover:text-foreground px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg border border-border/50 transition-colors animate-fade-in"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          <div className="flex justify-center items-center gap-6">
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-md active:scale-95 transition-transform"
              onClick={() => handleSwipeAction('left')}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full border-2 border-accent text-accent-foreground hover:bg-accent shadow-md active:scale-95 transition-transform"
              onClick={() => handleSwipeAction('nudge')}
            >
              <Zap className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-md active:scale-95 transition-transform"
              onClick={() => handleSwipeAction('right')}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Bottom Sheet */}
      <CandidateDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        profile={currentProfile || null}
        onAction={handleSwipeAction}
      />
    </div>
  );
}
