import { useState, useEffect, useRef } from "react";
import { SwipeDeck } from "@/components/discovery/SwipeDeck";
import { SplitPanelBrowser } from "@/components/discovery/desktop/SplitPanelBrowser";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { discoveryService, DiscoveryProfile } from "@/services/discoveryService";
import { swipeService, SwipeDirection } from "@/services/swipeService";
import { matchService } from "@/services/matchService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export function CandidateBrowseTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const swipedInSession = useRef<Set<string>>(new Set());


  useEffect(() => {
    if (user) {
      loadProfiles();
      loadStats();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await discoveryService.getDiscoveryProfiles(
        user.id, 
        'employee', 
        {}, 
        20,
        true // certifiedOnly - show only Lansa certified candidates
      );
      setProfiles(data.filter(p => !swipedInSession.current.has(p.user_id)));
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load candidate profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const matches = await matchService.getMatchesCount(user.id);
      setMatchCount(matches);
      
      // Get today's swipe count
      const swipeHistory = await swipeService.getSwipeHistory(user.id, 'employee');
      const today = new Date().toDateString();
      const todaySwipes = swipeHistory.filter(s => 
        new Date(s.created_at).toDateString() === today
      ).length;
      setSwipeCount(todaySwipes);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSwipe = async (profile: DiscoveryProfile, direction: SwipeDirection) => {
    if (!user) return;

    // Track immediately in session before async DB call
    swipedInSession.current.add(profile.user_id);
    setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id));

    try {
      const swipeData = {
        swiper_user_id: user.id,
        target_user_id: profile.user_id,
        direction,
        context: 'employee' as const
      };

      await swipeService.recordSwipe(swipeData);
      setSwipeCount(prev => prev + 1);

      // Note: In-app notifications are now handled server-side via DB trigger
      // (notify_candidate_on_swipe_trigger) — no client-side notification needed here

      // Check for match if it was a right swipe
      if (direction === 'right') {
        const match = await swipeService.checkForMatch(
          user.id, 
          profile.user_id, 
          'employee'
        );
        
        if (match) {
          matchService.celebrateMatch();
          setMatchCount(prev => prev + 1);
        }
      }

      // Show feedback based on direction
      if (direction === 'right') {
        toast.success('Interest shown! The candidate will be notified if they match.');
      } else if (direction === 'nudge') {
        toast.success('Super interest sent! This candidate will see your priority interest.');
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to record interest');
    }
  };

  // With certifiedOnly=true the pool is finite — no infinite scroll needed
  const handleEndReached = () => {
    return;
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employer-dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-[#2E2E2E]">Browse Candidates</h2>
            <p className="text-[#666666]">Swipe through talented professionals to find the perfect match</p>
          </div>
        </div>
      </div>

      {/* Swipe Interface - Desktop shows split panel, Mobile shows swipe deck */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isMobile ? (
          <div className="flex flex-col items-center justify-center h-full">
            <SwipeDeck
              profiles={profiles}
              onSwipe={handleSwipe}
              onEndReached={handleEndReached}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <SplitPanelBrowser
            profiles={profiles}
            onSwipe={handleSwipe}
            onEndReached={handleEndReached}
            isLoading={isLoading}
            matchCount={matchCount}
            swipeCount={swipeCount}
          />
        )}
      </div>

      {/* Help Button - Fixed in lower right corner */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
            aria-label="Show instructions"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-xl">How to Browse Candidates</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="font-semibold text-base">Pass</p>
                <p className="text-muted-foreground text-sm">Not a good fit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="font-semibold text-base">Super Interest</p>
                <p className="text-muted-foreground text-sm">Priority candidate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💚</span>
              </div>
              <div>
                <p className="font-semibold text-base">Interested</p>
                <p className="text-muted-foreground text-sm">Good potential match</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
}