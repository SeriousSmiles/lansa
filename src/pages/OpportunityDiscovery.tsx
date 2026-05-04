import { useState, useEffect } from "react";
import { SwipeDeck } from "@/components/discovery/SwipeDeck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Heart, TrendingUp, X, Zap } from "lucide-react";
import { discoveryService, DiscoveryProfile, DiscoveryFilters } from "@/services/discoveryService";
import { swipeService, SwipeDirection, SwipeContext } from "@/services/swipeService";
import { matchService } from "@/services/matchService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { usePortalMode } from "@/hooks/usePortalMode";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";

export default function OpportunityDiscovery() {
  const { user } = useAuth();
  const { portalV2 } = usePortalMode();
  // This route is guarded to job_seeker only. Networking discovery is for
  // employers reviewing candidates — seekers must never see other seekers.
  const [activeTab, setActiveTab] = useState<'jobs'>('jobs');
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [filters, setFilters] = useState<DiscoveryFilters>({});

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadStats();
    }
  }, [user, activeTab, filters]);

  const loadProfiles = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Seeker-only route: never load other seekers. Only job listings.
      const jobData = await discoveryService.getJobListings(user.id, filters, 20);
      const jobProfiles: DiscoveryProfile[] = jobData.map(job => ({
        user_id: job.id,
        name: job.business_profiles?.company_name || 'Company',
        title: job.title,
        about_text: job.description,
        profile_image: '',
        skills: job.top_skills || [],
        cover_color: '#1e40af',
        highlight_color: '#3b82f6',
        professional_goal: `Location: ${job.location || 'Remote'}`
      }));
      setProfiles(jobProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const matches = await matchService.getMatchesCount(user.id);
      setMatchCount(matches);
      
      // Get today's swipe count (seeker-only: internship/jobs context)
      const context: SwipeContext = 'internship';
      const swipeHistory = await swipeService.getSwipeHistory(user.id, context);
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
      const context: SwipeContext = 'internship';
      const swipeData = {
        swiper_user_id: user.id,
        target_user_id: profile.user_id,
        direction,
        context,
        job_listing_id: profile.user_id
      };

      await swipeService.recordSwipe(swipeData);
      setSwipeCount(prev => prev + 1);

      // Check for match if it was a right swipe
      if (direction === 'right') {
        const match = await swipeService.checkForMatch(
          user.id, 
          profile.user_id, 
          context,
          swipeData.job_listing_id
        );
        
        if (match) {
          matchService.celebrateMatch();
          setMatchCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to record swipe');
    }
  };

  const handleEndReached = () => {
    loadProfiles(); // Load more profiles
  };

  const legacyHeader = (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2">Opportunity Discovery</h1>
      <p className="text-muted-foreground">
        Discover new connections and opportunities
      </p>
    </div>
  );

  const inner = (
    <>
      {!portalV2 && legacyHeader}
      {/* Stats + Tabs body — preserved as-is */}
      <DiscoveryBody
        matchCount={matchCount}
        swipeCount={swipeCount}
        profiles={profiles}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSwipe={handleSwipe}
        handleEndReached={handleEndReached}
        isLoading={isLoading}
      />
    </>
  );

  if (portalV2) {
    return (
      <PortalPageShell
        eyebrow="Discover"
        title="Opportunity discovery"
        subtitle="Discover new connections and opportunities."
      >
        <div className="max-w-4xl mx-auto flex flex-col">{inner}</div>
      </PortalPageShell>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-4xl h-full overflow-hidden flex flex-col">
        {inner}
      </div>
    </div>
  );
}

// Inline body extracted to keep both branches identical.
function DiscoveryBody(props: any) {
  const { matchCount, swipeCount, profiles, activeTab, setActiveTab, handleSwipe, handleEndReached, isLoading } = props;
  return (
    <>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 flex-shrink-0">
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
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs-only surface — networking discovery removed; seekers must
            never see other seekers per project data-integrity rules. */}
        <div className="w-full flex-1 flex flex-col min-h-0">
          <div className="text-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Opportunities
            </h2>
            <p className="text-muted-foreground">
              Discover exciting job opportunities that match your skills
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
            <SwipeDeck
              profiles={profiles}
              onSwipe={handleSwipe}
              onEndReached={handleEndReached}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-4 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Swipe Left / ❌</p>
                  <p className="text-muted-foreground">Not interested</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Super Like / ⚡</p>
                  <p className="text-muted-foreground">Very interested</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Swipe Right / 💚</p>
                  <p className="text-muted-foreground">Interested</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </>
  );
}