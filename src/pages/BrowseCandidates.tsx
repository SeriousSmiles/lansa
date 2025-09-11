import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwipeDeck } from "@/components/discovery/SwipeDeck";
import { LoadingSpinner } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryService } from "@/services/discoveryService";
import { matchService } from "@/services/matchService";
import { swipeService } from "@/services/swipeService";
import type { DiscoveryProfile } from "@/services/discoveryService";
import { useToast } from "@/hooks/use-toast";
import { EmployerTopNavbar } from "@/components/dashboard/employer/EmployerTopNavbar";

// Using DiscoveryProfile from service instead

export default function BrowseCandidates() {
  const { user } = useAuth();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);

  // Redirect non-employers
  if (!userTypeLoading && userType !== 'employer') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (user?.id && userType === 'employer') {
      loadProfiles();
      loadStats();
    }
  }, [user?.id, userType]);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await discoveryService.getDiscoveryProfiles(user!.id, 'employee');
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: "Error loading candidates",
        description: "Failed to load candidate profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const matchesData = await matchService.getMatches(user!.id);
      setMatchCount(matchesData.length);

      // For now, we'll track swipes in state since the service doesn't have getTodaySwipeCount
      // This would be implemented as part of extending the swipe service
      setSwipeCount(0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSwipe = async (profile: DiscoveryProfile, direction: 'left' | 'right' | 'nudge') => {
    try {
      await swipeService.recordSwipe({
        swiper_user_id: user!.id,
        target_user_id: profile.user_id,
        direction: direction === 'right' ? 'right' : direction === 'nudge' ? 'nudge' : 'left',
        context: 'employee',
      });

      if (direction === 'right') {
        const isMatch = await swipeService.checkForMatch(
          user!.id,
          profile.user_id,
          'employee'
        );

        if (isMatch) {
          toast({
            title: "It's a match! 🎉",
            description: "You and this candidate are both interested. Start a conversation!",
          });
          setMatchCount(prev => prev + 1);
        }
      }

      setSwipeCount(prev => prev + 1);
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Failed to record your action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndReached = () => {
    loadProfiles();
  };

  if (userTypeLoading || isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EmployerTopNavbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse Candidates</h1>
              <p className="text-muted-foreground mt-1">
                Discover talented professionals ready for opportunities
              </p>
            </div>
            <Link to="/employer-dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchCount}</div>
              <p className="text-xs text-muted-foreground">
                Mutual connections made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swipeCount}</div>
              <p className="text-xs text-muted-foreground">
                Profiles reviewed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to connect
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Swipe Interface */}
        <div className="max-w-4xl mx-auto">
          <SwipeDeck
            profiles={profiles}
            onSwipe={handleSwipe}
            onEndReached={handleEndReached}
          />
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Browse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm"><strong>Swipe Left or Click ✕:</strong> Pass on this candidate</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm"><strong>Swipe Up or Click ⭐:</strong> Super Interest - Stand out to candidates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm"><strong>Swipe Right or Click ❤️:</strong> Interested - If mutual, it's a match!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}