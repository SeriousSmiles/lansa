import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, FileText, Eye, Clock, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalViews: number;
  candidatesViewed: number;
  averageTimeToHire: string;
  conversionRate: string;
}

export function EmployerAnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalJobs: 0,
    activeJobs: 0,
    totalViews: 0,
    candidatesViewed: 0,
    averageTimeToHire: "N/A",
    conversionRate: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadAnalytics() {
      if (!user?.id) return;

      try {
        // Get business profile
        const { data: businessProfile } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (businessProfile) {
          // Get job statistics
          const { data: allJobs, count: totalCount } = await supabase
            .from('job_listings')
            .select('*', { count: 'exact' })
            .eq('business_id', businessProfile.id);

          const { count: activeCount } = await supabase
            .from('job_listings')
            .select('*', { count: 'exact' })
            .eq('business_id', businessProfile.id)
            .eq('is_active', true);

          setAnalytics(prev => ({
            ...prev,
            totalJobs: totalCount || 0,
            activeJobs: activeCount || 0
          }));
        }

        // Get candidate interaction statistics
        const { count: swipeCount } = await supabase
          .from('swipes')
          .select('*', { count: 'exact' })
          .eq('swiper_user_id', user.id);

        const { count: matchCount } = await supabase
          .from('matches')
          .select('*', { count: 'exact' })
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

        const conversionRate = swipeCount && swipeCount > 0 
          ? Math.round((matchCount || 0) / swipeCount * 100) 
          : 0;

        setAnalytics(prev => ({
          ...prev,
          candidatesViewed: swipeCount || 0,
          conversionRate: `${conversionRate}%`
        }));

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [user?.id]);

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
      description: "Total candidate interactions"
    },
    {
      title: "Match Rate",
      value: analytics.conversionRate,
      icon: TrendingUp,
      description: "Mutual interest rate"
    },
    {
      title: "Avg. Time to Hire",
      value: analytics.averageTimeToHire,
      icon: Clock,
      description: "Coming soon"
    },
    {
      title: "Profile Views",
      value: analytics.totalViews.toString(),
      icon: Eye,
      description: "Coming soon"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#666666] animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2E2E2E]">Analytics Dashboard</h2>
        <p className="text-[#666666]">Track your hiring performance and candidate engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#666666]">{card.title}</p>
                  <p className="text-2xl font-bold text-[#2E2E2E]">{card.value}</p>
                  <p className="text-xs text-[#666666]">{card.description}</p>
                </div>
                <card.icon className="h-8 w-8 text-[#FF6B4A]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiring Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Funnel Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Job Postings</span>
              <span className="text-lg font-bold">{analytics.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Candidates Viewed</span>
              <span className="text-lg font-bold">{analytics.candidatesViewed}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Mutual Interests</span>
              <span className="text-lg font-bold">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Hires Made</span>
              <span className="text-lg font-bold">Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-[#666666]">
            <p>• Your match rate of {analytics.conversionRate} shows good candidate targeting</p>
            <p>• You've reviewed {analytics.candidatesViewed} candidate profiles so far</p>
            <p>• {analytics.activeJobs} active job{analytics.activeJobs !== 1 ? 's are' : ' is'} currently recruiting</p>
            <p>• Advanced analytics and hiring insights coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}