import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, FileText, Target, Handshake, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  candidatesViewed: number;
  rightSwipes: number;
  mutualMatches: number;
  applicationsReceived: number;
  matchRate: string;
}

export function EmployerAnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalJobs: 0,
    activeJobs: 0,
    candidatesViewed: 0,
    rightSwipes: 0,
    mutualMatches: 0,
    applicationsReceived: 0,
    matchRate: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();

  useEffect(() => {
    async function loadAnalytics() {
      if (!user?.id || !activeOrganization?.id) return;

      try {
        // Job stats via job_listings_v2 + organization_id
        const [
          { count: totalJobCount },
          { count: activeJobCount },
          { count: totalSwipeCount },
          { count: rightSwipeCount },
          { count: matchCount },
          { count: appCount },
        ] = await Promise.all([
          supabase
            .from('job_listings_v2')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id),
          supabase
            .from('job_listings_v2')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id)
            .eq('is_active', true),
          supabase
            .from('swipes')
            .select('*', { count: 'exact', head: true })
            .eq('swiper_user_id', user.id)
            .eq('context', 'employee'),
          supabase
            .from('swipes')
            .select('*', { count: 'exact', head: true })
            .eq('swiper_user_id', user.id)
            .eq('context', 'employee')
            .eq('direction', 'right'),
          supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
            .eq('context', 'employee'),
          supabase
            .from('job_applications_v2')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id),
        ]);

        const total = totalSwipeCount || 0;
        const matches = matchCount || 0;
        const matchRate = total > 0 ? Math.round((matches / total) * 100) : 0;

        setAnalytics({
          totalJobs: totalJobCount || 0,
          activeJobs: activeJobCount || 0,
          candidatesViewed: total,
          rightSwipes: rightSwipeCount || 0,
          mutualMatches: matches,
          applicationsReceived: appCount || 0,
          matchRate: `${matchRate}%`,
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [user?.id, activeOrganization?.id]);

  const analyticsCards = [
    {
      title: "Total Job Listings",
      value: analytics.totalJobs.toString(),
      icon: FileText,
      description: "All-time job postings"
    },
    {
      title: "Active Jobs",
      value: analytics.activeJobs.toString(),
      icon: Target,
      description: "Currently recruiting"
    },
    {
      title: "Candidates Viewed",
      value: analytics.candidatesViewed.toString(),
      icon: Users,
      description: "Total profiles reviewed"
    },
    {
      title: "Interested In",
      value: analytics.rightSwipes.toString(),
      icon: Handshake,
      description: "Right swipes sent"
    },
    {
      title: "Mutual Matches",
      value: analytics.mutualMatches.toString(),
      icon: TrendingUp,
      description: "Confirmed connections"
    },
    {
      title: "Applications Received",
      value: analytics.applicationsReceived.toString(),
      icon: ClipboardList,
      description: "Direct job applications"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your hiring performance and candidate engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
                <card.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiring Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Job Postings", value: analytics.totalJobs, color: "bg-primary" },
              { label: "Candidates Reviewed", value: analytics.candidatesViewed, color: "bg-primary/70" },
              { label: "Interest Sent (Right Swipes)", value: analytics.rightSwipes, color: "bg-primary/50" },
              { label: "Mutual Matches", value: analytics.mutualMatches, color: "bg-primary/30" },
              { label: "Applications Received", value: analytics.applicationsReceived, color: "bg-secondary" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${row.color}`} />
                  <span className="font-medium text-foreground">{row.label}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-muted-foreground text-sm">
            <p>• Your match rate is <span className="font-semibold text-foreground">{analytics.matchRate}</span> — based on mutual interests vs total candidates reviewed</p>
            <p>• You've reviewed <span className="font-semibold text-foreground">{analytics.candidatesViewed}</span> candidate profiles and expressed interest in <span className="font-semibold text-foreground">{analytics.rightSwipes}</span></p>
            <p>• <span className="font-semibold text-foreground">{analytics.mutualMatches}</span> mutual match{analytics.mutualMatches !== 1 ? 'es' : ''} confirmed — candidates who are interested back</p>
            <p>• <span className="font-semibold text-foreground">{analytics.activeJobs}</span> active job{analytics.activeJobs !== 1 ? 's are' : ' is'} currently accepting applications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
