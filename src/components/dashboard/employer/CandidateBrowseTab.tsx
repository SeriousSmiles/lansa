import { useState, useEffect } from "react";
import { SwipeDeck } from "@/components/discovery/SwipeDeck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, TrendingUp } from "lucide-react";
import { discoveryService, DiscoveryProfile } from "@/services/discoveryService";
import { swipeService, SwipeDirection } from "@/services/swipeService";
import { matchService } from "@/services/matchService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function CandidateBrowseTab() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);

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
      const data = await discoveryService.getDiscoveryProfiles(user.id, 'employee', {}, 20);
      setProfiles(data);
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

    try {
      const swipeData = {
        swiper_user_id: user.id,
        target_user_id: profile.user_id,
        direction,
        context: 'employee' as const
      };

      await swipeService.recordSwipe(swipeData);
      setSwipeCount(prev => prev + 1);

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

  const handleEndReached = () => {
    loadProfiles(); // Load more profiles
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2E2E2E]">Browse Candidates</h2>
          <p className="text-[#666666]">Swipe through talented professionals to find the perfect match</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matchCount}</p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{swipeCount}</p>
                <p className="text-sm text-muted-foreground">Today's Swipes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profiles.length}</p>
                <p className="text-sm text-muted-foreground">Available Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swipe Interface */}
      <div className="flex flex-col items-center">
        <SwipeDeck
          profiles={profiles}
          onSwipe={handleSwipe}
          onEndReached={handleEndReached}
          isLoading={isLoading}
        />
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">How to Browse Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600">❌</span>
              </div>
              <div>
                <p className="font-medium">Pass</p>
                <p className="text-muted-foreground">Not a good fit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600">⚡</span>
              </div>
              <div>
                <p className="font-medium">Super Interest</p>
                <p className="text-muted-foreground">Priority candidate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">💚</span>
              </div>
              <div>
                <p className="font-medium">Interested</p>
                <p className="text-muted-foreground">Good potential match</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}