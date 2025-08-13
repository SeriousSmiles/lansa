import { useState, useEffect } from "react";
import { SwipeDeck } from "@/components/discovery/SwipeDeck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Heart, TrendingUp, X, Zap } from "lucide-react";
import { discoveryService, DiscoveryProfile, DiscoveryFilters } from "@/services/discoveryService";
import { swipeService, SwipeDirection, SwipeContext } from "@/services/swipeService";
import { matchService } from "@/services/matchService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OpportunityDiscovery() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'networking' | 'jobs'>('networking');
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
      const context: SwipeContext = activeTab === 'networking' ? 'employee' : 'internship';
      
      if (activeTab === 'networking') {
        const data = await discoveryService.getDiscoveryProfiles(user.id, context, filters, 20);
        setProfiles(data);
      } else {
        // For jobs, we'd load job listings here
        const jobData = await discoveryService.getJobListings(user.id, filters, 20);
        // Convert job listings to profile format for the swipe deck
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
      }
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
      
      // Get today's swipe count
      const context: SwipeContext = activeTab === 'networking' ? 'employee' : 'internship';
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
      const context: SwipeContext = activeTab === 'networking' ? 'employee' : 'internship';
      const swipeData = {
        swiper_user_id: user.id,
        target_user_id: profile.user_id,
        direction,
        context,
        job_listing_id: activeTab === 'jobs' ? profile.user_id : undefined
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-4xl overflow-x-hidden">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Opportunity Discovery</h1>
          <p className="text-muted-foreground">
            Discover new connections and opportunities
          </p>
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
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discovery Mode Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'networking' | 'jobs')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="networking" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Networking
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="networking" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Professional Networking</h2>
              <p className="text-muted-foreground">
                Connect with like-minded professionals and expand your network
              </p>
            </div>
            
            <SwipeDeck
              profiles={profiles}
              onSwipe={handleSwipe}
              onEndReached={handleEndReached}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Job Opportunities</h2>
              <p className="text-muted-foreground">
                Discover exciting job opportunities that match your skills
              </p>
            </div>
            
            <SwipeDeck
              profiles={profiles}
              onSwipe={handleSwipe}
              onEndReached={handleEndReached}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8">
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
      </div>
    </div>
  );
}