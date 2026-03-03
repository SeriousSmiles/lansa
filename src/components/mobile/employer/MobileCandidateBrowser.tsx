import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X, Filter, ArrowLeft, Users, Zap, Undo2, CheckCircle2, MessageCircle } from "lucide-react";
import { SwipeableContainer, SwipeableContainerHandle } from "../SwipeableContainer";
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

  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [matchCandidate, setMatchCandidate] = useState<DiscoveryProfile | null>(null);
  const [undoProfile, setUndoProfile] = useState<DiscoveryProfile | null>(null);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<SwipeableContainerHandle>(null);
  const swipedInSession = useRef<Set<string>>(new Set());

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const thirdProfile = profiles[currentIndex + 2];

  useEffect(() => {
    loadCandidates();
    loadStats();
  }, [filters]);

  useEffect(() => {
    if (headerRef.current) {
      mobileAnimations.pageSlideIn(headerRef.current);
    }
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const newProfiles = await candidateDiscoveryService.getFilteredCandidates(userId, filters, 20);
      // Filter out any profiles swiped during this session (catches race condition with async DB inserts)
      const filtered = newProfiles.filter(p => !swipedInSession.current.has(p.user_id));
      setProfiles(filtered);
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

    // Synchronously track this swipe before any async work — prevents race condition on reload
    swipedInSession.current.add(currentProfile.user_id);

    if (direction === 'left') {
      setUndoProfile(currentProfile);
      if (undoTimer) clearTimeout(undoTimer);
      const timer = setTimeout(() => setUndoProfile(null), 4000);
      setUndoTimer(timer);
    } else {
      setUndoProfile(null);
    }

    try {
      const result = await candidateDiscoveryService.swipeCandidate(userId, currentProfile, direction);
      if (result.isMatch) {
        setMatchCandidate(currentProfile);
        loadStats();
      }
    } catch (error) {
      console.error('Error swiping candidate:', error);
    }

    const nextIdx = currentIndex + 1;
    // No prefetch-append to avoid showing already-swiped candidates
    if (nextIdx < profiles.length) {
      setCurrentIndex(nextIdx);
    } else {
      loadCandidates();
    }

    setStats(prev => ({ ...prev, todayCount: prev.todayCount + 1 }));
  }, [currentProfile, currentIndex, profiles, userId, filters, undoTimer]);

  const handleUndo = useCallback(async () => {
    if (!undoProfile) return;
    mobileUtils.hapticFeedback('medium');
    await swipeService.deleteLastSwipe(userId, 'employee');
    // Remove from session set so it can reappear after undo
    swipedInSession.current.delete(undoProfile.user_id);
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

  // Branded empty state
  if (!currentProfile && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">You're all caught up!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You've reviewed all available candidates. Check back later as new talent joins the platform.
            </p>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/60 rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{stats.todayCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reviewed today</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-primary">{stats.matchCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total matches</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate('/chat')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              View Matches & Messages
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <div className="relative w-full h-[calc(100vh-220px)] max-h-[760px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {thirdProfile && (
                <EnhancedCandidateCard profile={thirdProfile} stackPosition={2} />
              )}
              {nextProfile && (
                <EnhancedCandidateCard profile={nextProfile} stackPosition={1} />
              )}
              {currentProfile && (
                <SwipeableContainer
                  ref={swipeRef}
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
            <button
              className="w-14 h-14 rounded-full border-[2.5px] border-red-500 flex items-center justify-center bg-card shadow-md active:scale-95 transition-all"
              style={{ color: '#ef4444' }}
              onClick={() => swipeRef.current?.triggerSwipe('left')}
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button
              className="w-12 h-12 rounded-full border-[2.5px] border-amber-500 flex items-center justify-center bg-card shadow-md active:scale-95 transition-all"
              style={{ color: '#f59e0b' }}
              onClick={() => handleSwipeAction('nudge')}
            >
              <Zap className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button
              className="w-14 h-14 rounded-full border-[2.5px] flex items-center justify-center bg-card shadow-md active:scale-95 transition-all"
              style={{ borderColor: '#2563eb', color: '#2563eb' }}
              onClick={() => swipeRef.current?.triggerSwipe('right')}
            >
              <Heart className="w-6 h-6" strokeWidth={2.5} style={{ color: '#2563eb', stroke: '#2563eb' }} />
            </button>
          </div>
        </div>
      )}

      <CandidateDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        profile={currentProfile || null}
        onAction={handleSwipeAction}
      />
    </div>
  );
}
