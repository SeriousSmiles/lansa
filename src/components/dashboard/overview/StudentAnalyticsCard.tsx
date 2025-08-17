import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, TrendingUp, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StudentAnalytics {
  profileViews: number;
  rightSwipes: number;
  nudges: number;
  matches: number;
  listedSince: string | null;
  totalSwipes: number;
  matchRate: number;
}

export function StudentAnalyticsCard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics>({
    profileViews: 0,
    rightSwipes: 0,
    nudges: 0,
    matches: 0,
    listedSince: null,
    totalSwipes: 0,
    matchRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [isListed, setIsListed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAnalytics = async () => {
      try {
        // Check certification status
        const { data: certification } = await supabase
          .from('user_certifications')
          .select('lansa_certified, certified_at')
          .eq('user_id', user.id)
          .single();

        if (!certification?.lansa_certified) {
          setIsCertified(false);
          setIsLoading(false);
          return;
        }

        setIsCertified(true);

        // Check if user is listed in catalogue
        const { data: catalogueEntry } = await supabase
          .from('catalogue_entries')
          .select('is_active, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (!catalogueEntry) {
          setIsListed(false);
          setIsLoading(false);
          return;
        }

        setIsListed(true);

        // Fetch swipe analytics where this user was the target
        const { data: swipeData } = await supabase
          .from('swipes')
          .select('direction, created_at')
          .eq('target_user_id', user.id);

        // Fetch matches
        const { data: matchData } = await supabase
          .from('matches')
          .select('id, created_at')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

        if (swipeData) {
          const rightSwipes = swipeData.filter(s => s.direction === 'right').length;
          const nudges = swipeData.filter(s => s.direction === 'nudge').length;
          const totalSwipes = swipeData.length;
          const matches = matchData?.length || 0;
          const matchRate = totalSwipes > 0 ? Math.round((matches / totalSwipes) * 100) : 0;

          setAnalytics({
            profileViews: totalSwipes,
            rightSwipes,
            nudges,
            matches,
            listedSince: catalogueEntry.created_at,
            totalSwipes,
            matchRate,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isCertified) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
            <Badge variant="outline" className="ml-auto">
              <Award className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Complete Your Lansa Certification</h3>
            <p className="text-muted-foreground">
              Pass the Lansa certification test to unlock your analytics dashboard and get listed online.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isListed) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
            <Badge variant="outline" className="ml-auto">
              Not Listed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Get Listed Online</h3>
            <p className="text-muted-foreground">
              Activate your profile listing to start receiving views and unlock analytics insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatListedSince = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics Dashboard
          <Badge variant="default" className="ml-auto bg-green-500 hover:bg-green-600">
            <Award className="h-3 w-3 mr-1" />
            Certified
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Listed since {formatListedSince(analytics.listedSince)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Eye className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.profileViews}</p>
            <p className="text-sm text-muted-foreground">Profile Views</p>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Heart className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.rightSwipes}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.nudges}</p>
            <p className="text-sm text-muted-foreground">Nudges</p>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.matches}</p>
            <p className="text-sm text-muted-foreground">Matches</p>
          </div>
        </div>
        
        {analytics.totalSwipes > 0 && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Match Rate</span>
              <span className="text-lg font-bold text-primary">{analytics.matchRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${analytics.matchRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}